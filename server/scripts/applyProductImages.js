// applyProductImages.js
// ─────────────────────────────────────────────
// Asigna las imágenes por regla (utils/productImages.js) a los productos existentes que no
// tienen foto: MOTOR 102* -> lienzo, MOTOR 101* y 103* -> caja chica de bulones.
// Nunca pisa una imagen existente. Los productos nuevos las reciben solos al subir el Excel.
//
//   npm run apply-product-images         ← DRY-RUN: solo muestra
//   npm run apply-product-images:apply   ← aplica y sincroniza Typesense
// ─────────────────────────────────────────────

import mongoose from "mongoose";
import { connectToDB } from "../db/dbConnection.js";
import Product from "../models/product.model.js";
import { syncFilterToTypesense } from "../controllers/product.controller.js";
import { ruleImageFor, productsMissingRuleImage } from "../utils/productImages.js";
import { NODE_ENV } from "../config/envConfig.js";

const APPLY = process.argv.includes("--apply");

async function run() {
    mongoose.set("autoIndex", false); // el script no debe crear índices
    console.log(`🖼️  Imágenes por regla (${NODE_ENV}) — ${APPLY ? "⚠️  APPLY" : "🔍 DRY-RUN: no se modifica nada"}\n`);
    await connectToDB();

    const products = await Product.find(productsMissingRuleImage()).select("codpro desc_rubro").lean();
    const byImage = new Map();
    for (const p of products) {
        const img = ruleImageFor(p);
        if (!img) continue; // no debería pasar: el filtro y la regla coinciden
        byImage.set(img, [...(byImage.get(img) ?? []), p]);
    }

    for (const [img, list] of byImage) {
        console.log(`${img}: ${list.length} productos (ej: ${list.slice(0, 5).map(p => p.codpro).join(", ")}${list.length > 5 ? ", …" : ""})`);
    }
    if (products.length === 0) {
        console.log("✅ No hay productos sin imagen alcanzados por las reglas. Nada que hacer.");
        return;
    }
    if (!APPLY) {
        console.log(`\nSe asignarían ${products.length} imágenes. Para aplicar: npm run apply-product-images:apply`);
        return;
    }

    const ids = [];
    for (const [img, list] of byImage) {
        const listIds = list.map(p => p._id);
        // Se repite la condición "sin imagen" por si alguien le puso una foto mientras corría el script
        await Product.updateMany({ _id: { $in: listIds }, $or: [{ imageUrl: null }, { imageUrl: "" }, { imageUrl: { $exists: false } }] }, { $set: { imageUrl: img } });
        ids.push(...listIds);
    }
    console.log(`\n✔ Mongo: ${ids.length} productos actualizados`);
    const ts = await syncFilterToTypesense({ _id: { $in: ids } });
    console.log(`✔ Typesense: ${ts.synced} sincronizados, ${ts.failed} con error${ts.error ? ` (${ts.error}) -> correr npm run typesense-sync` : ""}`);
}

run()
    .catch(err => {
        console.error("❌ Error:", err);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
