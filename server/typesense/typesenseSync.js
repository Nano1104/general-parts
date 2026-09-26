// typesenseSync.js
// ─────────────────────────────────────────────
// Ejecutar UNA VEZ para cargar todos los productos
// de MongoDB a Typesense:
//
//   node typesenseSync.js
//   node typesenseSync.js --reset   ← borra y re-indexa todo
// ─────────────────────────────────────────────

import mongoose from "mongoose";
/* import "dotenv/config"; */
import client from "./client.js";
import { connectToDB } from "../db/dbConnection.js";
import { ensureCollection, recreateCollection, assertCollectionMatchesEnv, COLLECTION_NAME } from "./collection.js";
import { NODE_ENV, TYPESENSE_HOST } from "../config/envConfig.js";
import Product from "../models/product.model.js"; // ajusta el path

const BATCH_SIZE = 500;

// 🔄 Convierte un documento de MongoDB al formato que espera Typesense
// ⚠️  Esta función también se importa en product.controller.js — no tocar la firma
export function mongoToTypesense(doc) {
    const obj = doc.toObject ? doc.toObject() : doc;
    const codpro = obj.codpro ?? "";

    return {
        id: obj._id.toString(),
        codpro,
        codpro_suffix: codpro.replace(/^\d+/, ""),

        desc_stock: obj.desc_stock ?? "",
        desc_marca: obj.desc_marca ?? "",
        desc_rubro: obj.desc_rubro ?? "",
        desc_subrub: obj.desc_subrub ?? "",
        desc_subrubro_intermedio: obj.desc_subrubro_intermedio ?? "",
        precioimpre: obj.precioimpre ?? 0,
        // ✅ Seguro contra floats que vengan de Mongo
        stock: Math.round(obj.stock ?? 0),
        rubro: Math.round(obj.rubro ?? 0),
        subrub: Math.round(obj.subrub ?? 0),
        proveed: Math.round(obj.proveed ?? 0),
        destacado: obj.destacado ?? false,
        imageUrl: obj.imageUrl ?? "",
        prod_details: obj.prod_details ?? "",
    };
}

// 🚀 Función principal de sincronización
async function syncAllProducts() {
    const isReset = process.argv.includes("--reset");

    assertCollectionMatchesEnv();
    console.log(`🔎 Mongo: ${NODE_ENV} → Typesense: ${TYPESENSE_HOST || "localhost"} / colección "${COLLECTION_NAME}"${isReset ? " (RESET)" : ""}`);

    await connectToDB();

    if (isReset) {
        await recreateCollection();
    } else {
        await ensureCollection();
    }

    const total = await Product.countDocuments();
    console.log(`📦 Total de productos a indexar: ${total}`);

    let indexed = 0;
    let cursor = null;

    while (true) {
        const query = cursor ? { _id: { $gt: cursor } } : {};
        const batch = await Product.find(query).sort({ _id: 1 }).limit(BATCH_SIZE).lean();

        if (batch.length === 0) break;

        const documents = batch.map(mongoToTypesense);

        const results = await client
            .collections(COLLECTION_NAME)
            .documents()
            .import(documents, { action: "upsert" });

        const errors = results.filter(r => !r.success);
        if (errors.length > 0) {
            console.warn(`⚠️  ${errors.length} errores en este lote:`, errors.slice(0, 3));
        }

        indexed += batch.length;
        cursor = batch[batch.length - 1]._id;

        const pct = ((indexed / total) * 100).toFixed(1);
        console.log(`  ✔ ${indexed}/${total} (${pct}%)`);
    }

    console.log(`\n🎉 Sincronización completa: ${indexed} productos indexados en Typesense`);
    await mongoose.disconnect();
}

// ✅ Solo ejecutar cuando se llama directamente como script
//    NO cuando se importa desde product.controller.js u otros módulos
const isRunningDirectly = process.argv[1] && (
    process.argv[1].endsWith("typesenseSync.js") ||
    process.argv[1].includes("typesenseSync")
);

if (isRunningDirectly) {
    syncAllProducts().catch(err => {
        console.error("❌ Error durante sincronización:", err);
        process.exit(1);
    });
}