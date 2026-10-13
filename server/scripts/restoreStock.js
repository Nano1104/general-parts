// restoreStock.js
// ─────────────────────────────────────────────
// Repone a STOCK_DISPONIBLE el stock de los productos que quedaron sin stock
// (stock <= 0, null o inexistente), para que vuelvan a figurar "Disponible".
// Hasta E0 el carrito restaba stock, así que productos muy reservados quedaron en 0.
//
//   npm run restore-stock          ← SOLO muestra qué cambiaría (no escribe nada)
//   npm run restore-stock:apply    ← aplica en Mongo y sincroniza Typesense
// ─────────────────────────────────────────────

import mongoose from "mongoose";
import { connectToDB } from "../db/dbConnection.js";
import Product from "../models/product.model.js";
import client from "../typesense/client.js";
import { COLLECTION_NAME } from "../typesense/collection.js";
import { mongoToTypesense } from "../typesense/typesenseSync.js";
import { NODE_ENV, TYPESENSE_HOST } from "../config/envConfig.js";

const APPLY = process.argv.includes("--apply");
const STOCK_DISPONIBLE = 10; // mismo valor que fija la carga de Excel
const BATCH_SIZE = 500;

// $not $gt 0 cubre stock <= 0, null, inexistente y valores no numéricos
const SIN_STOCK = { stock: { $not: { $gt: 0 } } };

async function syncIdsToTypesense(ids) {
    let synced = 0;
    let failed = 0;
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const docs = await Product.find({ _id: { $in: ids.slice(i, i + BATCH_SIZE) } }).lean();
        const results = await client
            .collections(COLLECTION_NAME)
            .documents()
            .import(docs.map(mongoToTypesense), { action: "upsert" });
        const errors = results.filter(r => !r.success);
        if (errors.length > 0) console.error("⚠️  Errores de Typesense en el lote:", errors.slice(0, 3));
        failed += errors.length;
        synced += docs.length - errors.length;
    }
    return { synced, failed };
}

async function restoreStock() {
    console.log(`🔎 Entorno: ${NODE_ENV} → Mongo ${NODE_ENV === "production" ? "Atlas (producción)" : "local"} / Typesense ${TYPESENSE_HOST || "localhost"} colección "${COLLECTION_NAME}"`);
    console.log(APPLY ? "⚠️  MODO APPLY: se van a modificar productos\n" : "🔍 MODO DRY-RUN: no se modifica nada (usar --apply para aplicar)\n");

    await connectToDB();

    const total = await Product.countDocuments();
    const ids = await Product.find(SIN_STOCK).distinct("_id");
    console.log(`📦 Productos totales: ${total}`);
    console.log(`🚫 Productos sin stock: ${ids.length}`);

    if (ids.length === 0) {
        console.log("\n✅ Todos los productos ya figuran como disponibles. Nada que hacer.");
        return;
    }

    const sample = await Product.find(SIN_STOCK).select("codpro desc_stock stock -_id").limit(15).lean();
    console.log("\nMuestra (máx. 15):");
    console.table(sample);

    if (!APPLY) {
        console.log(`\nSe pondría stock = ${STOCK_DISPONIBLE} en ${ids.length} productos. Para aplicar: npm run restore-stock:apply`);
        return;
    }

    // Se actualiza por _id (no por SIN_STOCK) para tocar exactamente los productos listados
    const result = await Product.updateMany({ _id: { $in: ids } }, { $set: { stock: STOCK_DISPONIBLE } });
    console.log(`\n✔ Mongo: ${result.modifiedCount} productos actualizados a stock = ${STOCK_DISPONIBLE}`);

    try {
        const { synced, failed } = await syncIdsToTypesense(ids);
        console.log(`✔ Typesense: ${synced} sincronizados, ${failed} con error`);
        if (failed > 0) console.log("   → Correr `npm run typesense-sync` para reindexar.");
    } catch (err) {
        // Mongo ya quedó bien; el buscador solo muestra datos desactualizados de stock
        console.error(`⚠️  Typesense no disponible (${err.message}). Mongo ya quedó actualizado; correr \`npm run typesense-sync\` cuando vuelva.`);
    }

    const remaining = await Product.countDocuments(SIN_STOCK);
    console.log(remaining === 0
        ? "\n✅ Verificado: no quedan productos sin stock."
        : `\n⚠️  Todavía quedan ${remaining} productos sin stock (¿se modificaron durante la ejecución?).`);
}

restoreStock()
    .catch(err => {
        console.error("❌ Error:", err);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
