// integrityReport.js
// ─────────────────────────────────────────────
// Reporte de integridad de datos. SOLO LECTURA: no modifica nada.
// No imprime datos personales (solo cantidades y emails enmascarados).
//
//   npm run integrity-report
// ─────────────────────────────────────────────

import mongoose from "mongoose";
import { connectToDB } from "../db/dbConnection.js";
import Product from "../models/product.model.js";
import client from "../typesense/client.js";
import { COLLECTION_NAME } from "../typesense/collection.js";
import { NODE_ENV } from "../config/envConfig.js";

const SIX_MONTHS_AGO = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
const maskEmail = (e = "") => {
    const [user, domain] = String(e).split("@");
    return `${(user || "").slice(0, 2)}***@${domain ?? "?"}`;
};
const line = (label, value) => console.log(`  ${label.padEnd(58, ".")} ${value}`);

async function report() {
    // Que Mongoose no cree índices al importar los modelos: el script no debe escribir nada
    mongoose.set("autoIndex", false);
    await connectToDB();
    const db = mongoose.connection.db;
    const users = db.collection("users");
    const carts = db.collection("carts");
    const orders = db.collection("orders");
    const products = db.collection("products");
    const now = new Date();

    console.log(`\n📋 Reporte de integridad (${NODE_ENV}) — ${now.toISOString()}\n`);

    // ── Usuarios ─────────────────────────────────────────────
    console.log("👤 USUARIOS");
    line("Total", await users.countDocuments());
    const dupEmails = await users.aggregate([
        { $group: { _id: { $toLower: { $trim: { input: { $ifNull: ["$email", ""] } } } }, n: { $sum: 1 } } },
        { $match: { n: { $gt: 1 } } },
    ]).toArray();
    line("Emails duplicados (ignorando mayúsculas/espacios)", dupEmails.length);
    dupEmails.slice(0, 10).forEach(d => console.log(`      ${maskEmail(d._id)} x${d.n}`));
    line("Emails con mayúsculas o espacios", await users.countDocuments({ email: { $regex: /[A-Z]|^\s|\s$/ } }));
    const dupCuit = await users.aggregate([
        { $group: { _id: "$cuit", n: { $sum: 1 } } }, { $match: { n: { $gt: 1 } } },
    ]).toArray();
    line("CUITs repetidos", dupCuit.length);
    line("Usuarios sin carrito", await users.countDocuments({ $or: [{ cart: null }, { cart: { $exists: false } }] }));
    line("Usuarios con descuentos fuera de 0..100", await users.countDocuments({
        $or: ["discount_1", "discount_2", "discount_3"].map(f => ({ $or: [{ [f]: { $lt: 0 } }, { [f]: { $gt: 100 } }, { [f]: { $not: { $type: "number" } } }] })),
    }));
    line("Usuarios aceptados / pendientes", `${await users.countDocuments({ accepted: true })} / ${await users.countDocuments({ accepted: { $ne: true } })}`);

    // ── Carritos ─────────────────────────────────────────────
    console.log("\n🛒 CARRITOS");
    line("Total", await carts.countDocuments());
    const [cartUserOrphans] = await carts.aggregate([
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "u" } },
        { $match: { u: { $size: 0 } } }, { $count: "n" },
    ]).toArray();
    line("Carritos cuyo usuario no existe", cartUserOrphans?.n ?? 0);
    const [cartDangling] = await carts.aggregate([
        { $unwind: "$products" },
        { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "p" } },
        { $match: { p: { $size: 0 } } },
        { $group: { _id: null, items: { $sum: 1 }, carts: { $addToSet: "$_id" } } },
    ]).toArray();
    line("Ítems de carrito que apuntan a productos borrados", `${cartDangling?.items ?? 0} (en ${cartDangling?.carts.length ?? 0} carritos)`);
    const [badQty] = await carts.aggregate([
        { $unwind: "$products" },
        { $match: { $or: [{ "products.quantity": { $lte: 0 } }, { "products.quantity": { $not: { $type: "number" } } }] } },
        { $count: "n" },
    ]).toArray();
    line("Ítems de carrito con cantidad inválida", badQty?.n ?? 0);

    // ── Reservas ─────────────────────────────────────────────
    console.log("\n📦 RESERVAS");
    line("Total", await orders.countDocuments());
    const [orderOrphans] = await orders.aggregate([
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "u" } },
        { $match: { u: { $size: 0 } } }, { $count: "n" },
    ]).toArray();
    line("Reservas de usuarios que ya no existen (invisibles en el admin)", orderOrphans?.n ?? 0);
    const [orderDangling] = await orders.aggregate([
        { $unwind: "$products" },
        { $lookup: { from: "products", localField: "products.product", foreignField: "_id", as: "p" } },
        { $match: { p: { $size: 0 } } },
        { $group: { _id: null, items: { $sum: 1 }, orders: { $addToSet: "$_id" } } },
    ]).toArray();
    line("Líneas de reserva con productos borrados (no se muestran)", `${orderDangling?.items ?? 0} (en ${orderDangling?.orders.length ?? 0} reservas)`);
    const oldest = await orders.find().sort({ _id: 1 }).limit(1).toArray();
    const newest = await orders.find().sort({ _id: -1 }).limit(1).toArray();
    if (oldest[0]) line("Reserva más vieja / más nueva", `${oldest[0]._id.getTimestamp().toISOString().slice(0, 10)} / ${newest[0]._id.getTimestamp().toISOString().slice(0, 10)}`);

    // ── Productos ────────────────────────────────────────────
    console.log("\n🔩 PRODUCTOS");
    const totalProducts = await products.countDocuments();
    line("Total", totalProducts);
    line("Destacados", await products.countDocuments({ destacado: true }));
    line("Destacados ya vencidos o sin fecha de fin (trabados)", await products.countDocuments({
        destacado: true, $or: [{ fechaFinDestacado: { $lte: now } }, { fechaFinDestacado: null }],
    }));
    line("Sin stock (stock <= 0 o vacío)", await products.countDocuments({ stock: { $not: { $gt: 0 } } }));
    const validBrands = Product.schema.path("desc_marca").enumValues;
    line("Con marca fuera de la lista permitida", await products.countDocuments({ desc_marca: { $nin: validBrands } }));
    line("Con precio inválido (no numérico o <= 0)", await products.countDocuments({
        $or: [{ precioimpre: { $not: { $type: "number" } } }, { precioimpre: { $lte: 0 } }],
    }));
    const rubros = await products.distinct("desc_rubro");
    const normalized = new Map();
    for (const r of rubros) {
        const k = String(r ?? "").trim().toUpperCase();
        normalized.set(k, [...(normalized.get(k) ?? []), r]);
    }
    const rubroVariants = [...normalized.values()].filter(v => v.length > 1);
    line("Rubros distintos", rubros.length);
    line("Rubros duplicados por mayúsculas/espacios", rubroVariants.length);
    rubroVariants.slice(0, 10).forEach(v => console.log(`      ${v.map(x => JSON.stringify(x)).join(" / ")}`));
    line("Sin actualizar por Excel hace 6+ meses (o nunca)", await products.countDocuments({
        $or: [{ lastUpdated: { $lt: SIX_MONTHS_AGO } }, { lastUpdated: { $exists: false } }],
    }));
    const staleByRubro = await products.aggregate([
        { $match: { $or: [{ lastUpdated: { $lt: SIX_MONTHS_AGO } }, { lastUpdated: { $exists: false } }] } },
        { $group: { _id: "$desc_rubro", n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 8 },
    ]).toArray();
    staleByRubro.forEach(r => console.log(`      ${r._id}: ${r.n}`));

    // ── Índices ──────────────────────────────────────────────
    console.log("\n🗂️  ÍNDICES EXISTENTES");
    for (const c of ["users", "products", "carts", "orders"]) {
        const idx = await db.collection(c).indexes().catch(() => []);
        console.log(`  ${c}: ${idx.map(i => i.name + (i.unique ? " (unique)" : "")).join(", ") || "(colección vacía o inexistente)"}`);
    }

    // ── Typesense ────────────────────────────────────────────
    console.log("\n🔎 TYPESENSE");
    try {
        const col = await client.collections(COLLECTION_NAME).retrieve();
        line(`Documentos en "${COLLECTION_NAME}" vs productos en Mongo`, `${col.num_documents} vs ${totalProducts}`);
        const stuckInSearch = await client.collections(COLLECTION_NAME).documents().search({
            q: "*", filter_by: "destacado:=true", per_page: 1,
        });
        line("Destacados según el buscador", stuckInSearch.found);
    } catch (err) {
        line("Typesense no disponible", err.message);
    }

    console.log("\n✅ Fin del reporte (no se modificó nada).\n");
}

report()
    .catch(err => {
        console.error("❌ Error:", err);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
