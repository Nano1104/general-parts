// fixData.js
// ─────────────────────────────────────────────
// Corrige los problemas de datos detectados por integrity-report (E2).
// Por defecto es DRY-RUN: solo muestra qué haría. Con --apply escribe.
//
//   npm run fix-data          ← solo muestra
//   npm run fix-data:apply    ← aplica
//
// Es idempotente: correrlo de nuevo no cambia nada si ya está todo corregido.
// ─────────────────────────────────────────────

import mongoose from "mongoose";
import { connectToDB } from "../db/dbConnection.js";
import Product from "../models/product.model.js";
import { syncFilterToTypesense } from "../controllers/product.controller.js";
import { normalizeEmail } from "../utils/validation.js";
import { NODE_ENV } from "../config/envConfig.js";

const APPLY = process.argv.includes("--apply");
const maskEmail = (e = "") => `${String(e).slice(0, 2)}***@${String(e).split("@")[1] ?? "?"}`;

async function fixData() {
    // Que Mongoose no cree índices al importar modelos: los cambios de índices los hace este script explícitamente
    mongoose.set("autoIndex", false);
    console.log(`🔧 Corrección de datos (${NODE_ENV}) — ${APPLY ? "⚠️  APPLY: se van a escribir cambios" : "🔍 DRY-RUN: no se modifica nada"}\n`);
    await connectToDB();
    const db = mongoose.connection.db;

    // ── 1. Emails a minúsculas y sin espacios ─────────────────
    console.log("👤 EMAILS");
    const users = await db.collection("users").find({}, { projection: { email: 1 } }).toArray();
    const byNormalized = new Map();
    for (const u of users) {
        const k = normalizeEmail(String(u.email ?? ""));
        byNormalized.set(k, [...(byNormalized.get(k) ?? []), u]);
    }
    const toNormalize = users.filter(u => typeof u.email === "string" && u.email !== normalizeEmail(u.email));
    for (const u of toNormalize) {
        const target = normalizeEmail(u.email);
        if (byNormalized.get(target).length > 1) {
            console.log(`  ⚠️  ${maskEmail(target)}: hay otra cuenta con el mismo email; resolver a mano, no se toca`);
            continue;
        }
        console.log(`  ${maskEmail(u.email)} -> ${maskEmail(target)}`);
        if (APPLY) await db.collection("users").updateOne({ _id: u._id }, { $set: { email: target } });
    }
    console.log(`  ${toNormalize.length} emails a normalizar`);

    // ── 2. Índices de users: quitar password_1 (unique sin sentido) y crear email único ──
    console.log("\n🗂️  ÍNDICES DE USERS");
    const userIndexes = (await db.collection("users").indexes()).map(i => i.name);
    if (userIndexes.includes("password_1")) {
        console.log("  Borrar índice password_1 (unique sobre el hash de la contraseña: no aporta nada)");
        if (APPLY) await db.collection("users").dropIndex("password_1");
    }
    if (!userIndexes.includes("email_1")) {
        console.log("  Crear índice único email_1 (evita cuentas duplicadas)");
        if (APPLY) await db.collection("users").createIndex({ email: 1 }, { unique: true });
    }

    // ── 3. Carritos huérfanos (su usuario ya no existe) ───────
    console.log("\n🛒 CARRITOS HUÉRFANOS");
    const orphanCarts = await db.collection("carts").aggregate([
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "u" } },
        { $match: { u: { $size: 0 } } },
        { $project: { _id: 1 } },
    ]).toArray();
    // Por las dudas: nunca borrar un carrito que algún usuario tenga asignado
    const referenced = new Set((await db.collection("users").distinct("cart")).map(String));
    const cartsToDelete = orphanCarts.map(c => c._id).filter(id => !referenced.has(String(id)));
    console.log(`  ${cartsToDelete.length} carritos de usuarios borrados a eliminar`);
    if (APPLY && cartsToDelete.length) await db.collection("carts").deleteMany({ _id: { $in: cartsToDelete } });

    // ── 4. Precios inválidos ──────────────────────────────────
    console.log("\n💲 PRECIOS INVÁLIDOS (no numéricos o <= 0)");
    const badPrices = await db.collection("products").find(
        { $or: [{ precioimpre: { $not: { $type: "number" } } }, { precioimpre: { $lte: 0 } }] },
        { projection: { codpro: 1, desc_stock: 1, desc_rubro: 1, precioimpre: 1 } }
    ).toArray();
    const convertible = [];
    for (const p of badPrices) {
        const raw = p.precioimpre;
        const asNumber = typeof raw === "string" && /^\d+(\.\d+)?$/.test(raw.trim()) ? Number(raw.trim()) : null;
        const action = asNumber > 0 ? `-> se convierte a número ${asNumber}` : "-> revisar a mano (corregir en el próximo Excel del rubro)";
        console.log(`  ${String(p.codpro).padEnd(16)} ${String(p.desc_rubro).padEnd(12)} ${JSON.stringify(raw)} (${typeof raw})  ${action}`);
        if (asNumber > 0) convertible.push({ _id: p._id, value: asNumber });
    }
    console.log(`  ${badPrices.length} con precio inválido; ${convertible.length} se corrigen solos`);
    if (APPLY) {
        for (const { _id, value } of convertible) await db.collection("products").updateOne({ _id }, { $set: { precioimpre: value } });
    }

    // ── 5. Marcas fuera de la lista ───────────────────────────
    console.log("\n🏷️  MARCAS FUERA DE LA LISTA PERMITIDA (solo se listan)");
    const validBrands = Product.schema.path("desc_marca").enumValues;
    const badBrands = await db.collection("products").find(
        { desc_marca: { $nin: validBrands } }, { projection: { codpro: 1, desc_rubro: 1, desc_marca: 1 } }
    ).toArray();
    badBrands.forEach(p => console.log(`  ${String(p.codpro).padEnd(16)} ${String(p.desc_rubro).padEnd(12)} marca: ${JSON.stringify(p.desc_marca)}`));

    // ── 6. Colección de Agenda que ya no se usa ───────────────
    const collections = (await db.listCollections({}, { nameOnly: true }).toArray()).map(c => c.name);
    if (collections.includes("productHighlightJobs")) {
        console.log("\n🧹 Borrar colección productHighlightJobs (era de Agenda, ya no se usa)");
        if (APPLY) await db.collection("productHighlightJobs").drop();
    }

    // ── Typesense ─────────────────────────────────────────────
    if (APPLY && convertible.length) {
        const r = await syncFilterToTypesense({ _id: { $in: convertible.map(c => c._id) } });
        console.log(`\n🔎 Typesense: ${r.synced} sincronizados, ${r.failed} con error${r.error ? ` (${r.error}) -> correr npm run typesense-sync` : ""}`);
    }

    console.log(APPLY ? "\n✅ Cambios aplicados. Correr npm run integrity-report para verificar." : "\nPara aplicar: npm run fix-data:apply");
}

fixData()
    .catch(err => {
        console.error("❌ Error:", err);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
