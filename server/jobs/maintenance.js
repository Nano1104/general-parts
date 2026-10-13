// Tareas periódicas de mantenimiento de datos.
// Corren al arrancar el servidor y luego cada hora. Son idempotentes: si el servidor se reinicia
// (deploys, Render), la siguiente corrida recupera lo que haya quedado pendiente.
// Reemplazan a Agenda, que perdía los vencimientos programados en cada reinicio.

import Product from "../models/product.model.js";
import { syncFilterToTypesense } from "../controllers/product.controller.js";

const HOUR = 60 * 60 * 1000;

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

const TASKS = [expireHighlights];

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
