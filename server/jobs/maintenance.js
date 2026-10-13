// Tareas periódicas de mantenimiento de datos.
// Corren al arrancar el servidor y luego cada hora. Son idempotentes: si el servidor se reinicia
// (deploys, Render), la siguiente corrida recupera lo que haya quedado pendiente.
// Reemplazan a Agenda, que perdía los vencimientos programados en cada reinicio.

import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import { syncFilterToTypesense, deleteIdsFromTypesense } from "../controllers/product.controller.js";
import client from "../typesense/client.js";
import { COLLECTION_NAME } from "../typesense/collection.js";

const HOUR = 60 * 60 * 1000;
export const CART_TTL = 24 * HOUR;

// Quita el destacado a los productos cuya fecha de fin ya pasó y refleja el cambio en Typesense
export async function expireHighlights(now = new Date()) {
    const ids = await Product.find({ destacado: true, fechaFinDestacado: { $lte: now } }).distinct("_id");
    if (ids.length === 0) return 0;

    await Product.updateMany(
        { _id: { $in: ids } },
        { $set: { destacado: false }, $unset: { fechaFinDestacado: 1, highlightJobId: 1 } }
    );
    await syncFilterToTypesense({ _id: { $in: ids } });
    console.log(`⏱️  ${ids.length} destacados vencidos desactivados`);
    return ids.length;
}

// Vacía los carritos con productos que pasaron 1 día sin cambios ni reserva confirmada.
// Agregar o quitar un producto actualiza updatedAt y reinicia el plazo.
export async function expireCarts(now = new Date()) {
    // Carritos de antes de que existiera updatedAt: el plazo empieza a correr ahora, no se vacían de golpe
    await Cart.collection.updateMany(
        { "products.0": { $exists: true }, updatedAt: { $exists: false } },
        { $set: { updatedAt: now } }
    );

    const result = await Cart.updateMany(
        { "products.0": { $exists: true }, updatedAt: { $lte: new Date(now.getTime() - CART_TTL) } },
        { $set: { products: [] } }
    );
    if (result.modifiedCount > 0) console.log(`⏱️  ${result.modifiedCount} carritos vencidos vaciados`);
    return result.modifiedCount;
}

// Reconciliación Mongo → Typesense una vez por día (y al arrancar): reindexa todos los productos
// y borra del buscador los que ya no existen en Mongo. Repara lo que haya quedado desactualizado
// si Typesense falló durante una carga de Excel. Con ~2000 productos son unos pocos requests.
const DAY = 24 * HOUR;
let lastReconcile = 0;

export async function reconcileTypesense({ force = false } = {}) {
    if (!force && Date.now() - lastReconcile < DAY) return null;

    const sync = await syncFilterToTypesense({});
    if (sync.error) {
        // No se marca como hecha: se reintenta en la próxima corrida horaria
        console.error(`⚠️  Reconciliación con Typesense falló (${sync.error}); se reintenta en 1 hora`);
        return { ...sync, deleted: 0 };
    }

    const exported = await client.collections(COLLECTION_NAME).documents().export({ include_fields: "id" });
    const typesenseIds = exported.split("\n").filter(Boolean).map(line => JSON.parse(line).id);
    const mongoIds = new Set((await Product.distinct("_id")).map(String));
    const orphans = typesenseIds.filter(id => !mongoIds.has(id));

    let deleted = 0;
    if (orphans.length > 0 && (mongoIds.size === 0 || orphans.length > typesenseIds.length / 2)) {
        // Protección: si Mongo devolviera 0 productos o faltaran más de la mitad (DB equivocada,
        // falla de lectura), no se vacía el buscador; que lo revise una persona
        console.warn(`⚠️  Reconciliación: ${orphans.length} de ${typesenseIds.length} documentos no están en Mongo; no se borran automáticamente`);
    } else if (orphans.length > 0) {
        await deleteIdsFromTypesense(orphans);
        deleted = orphans.length;
    }

    lastReconcile = Date.now();
    console.log(`🔎 Reconciliación con Typesense: ${sync.synced} sincronizados, ${sync.failed} con error, ${deleted} huérfanos borrados`);
    return { ...sync, deleted };
}

const TASKS = [expireHighlights, expireCarts, reconcileTypesense];

async function runAll() {
    for (const task of TASKS) {
        try {
            await task();
        } catch (err) {
            // Un fallo no frena al resto ni al servidor; se reintenta en la próxima corrida
            console.error(`⚠️  Error en tarea de mantenimiento ${task.name}:`, err.message);
        }
    }
}

export function startMaintenanceJobs() {
    runAll();
    setInterval(runAll, HOUR).unref();
}
