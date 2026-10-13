// Tareas periódicas de mantenimiento de datos.
// Corren al arrancar el servidor y luego cada hora. Son idempotentes: si el servidor se reinicia
// (deploys, Render), la siguiente corrida recupera lo que haya quedado pendiente.
// Reemplazan a Agenda, que perdía los vencimientos programados en cada reinicio.

import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import { syncFilterToTypesense } from "../controllers/product.controller.js";

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

const TASKS = [expireHighlights, expireCarts];

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
