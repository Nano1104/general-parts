// typesenseSchema.js
import client from "./client.js";
import { NODE_ENV } from "../config/envConfig.js";

export const PROD_COLLECTION_NAME = "products";
export const DEV_COLLECTION_NAME = "products_dev";

// Desarrollo usa su propia colección: si el .env local apunta al servidor de Typesense
// de producción, los productos de la Mongo local no se mezclan con los del buscador real.
export const COLLECTION_NAME = NODE_ENV === "production" ? PROD_COLLECTION_NAME : DEV_COLLECTION_NAME;

// Aborta si la colección destino no corresponde a la Mongo de este entorno.
// Llamar antes de cualquier (re)indexado masivo.
export function assertCollectionMatchesEnv() {
    const expected = NODE_ENV === "production" ? PROD_COLLECTION_NAME : DEV_COLLECTION_NAME;
    if (COLLECTION_NAME !== expected) {
        throw new Error(
            `Colección Typesense "${COLLECTION_NAME}" no corresponde a NODE_ENV=${NODE_ENV} (esperada "${expected}"). ` +
            `Se mezclarían productos de otra base de datos.`
        );
    }
}

// 📋 Schema de la colección - espeja tu modelo de MongoDB
export const productsSchema = {
    name: COLLECTION_NAME,
    fields: [
        // ID y código
        { name: "id", type: "string" },   // = _id de MongoDB (string)
        { name: "codpro", type: "string", facet: true, infix: true },
        
        // "102REN06" → "REN06" | "3500580314523" → "" (todo números, queda vacío)
        { name: "codpro_suffix", type: "string", infix: true, optional: true },

        // Textos buscables (más importantes)
        { name: "desc_stock", type: "string" },
        { name: "desc_marca", type: "string", facet: true },
        { name: "desc_rubro", type: "string", facet: true },
        { name: "desc_subrub", type: "string", facet: true },
        { name: "desc_subrubro_intermedio", type: "string", facet: true, optional: true },

        // Números
        { name: "precioimpre", type: "float", facet: true },
        { name: "stock", type: "int32", facet: false },
        { name: "rubro", type: "int32", optional: true },
        { name: "subrub", type: "int32", optional: true },
        { name: "proveed", type: "int32", optional: true },

        // Booleanos y fechas
        { name: "destacado", type: "bool", facet: true, optional: true },

        // Extras opcionales
        { name: "imageUrl", type: "string", optional: true },
        { name: "prod_details", type: "string", optional: true },
    ],

    // Campo por defecto para ordenar (los más destacados primero)
    default_sorting_field: "precioimpre",
};

// 🏗️ Crear colección si no existe
export async function ensureCollection() {
    try {
        await client.collections(COLLECTION_NAME).retrieve();
        console.log(`✅ Typesense: colección "${COLLECTION_NAME}" ya existe`);
    } catch (err) {
        if (err.httpStatus === 404) {
            await client.collections().create(productsSchema);
            console.log(`🆕 Typesense: colección "${COLLECTION_NAME}" creada`);
        } else {
            throw err;
        }
    }
}

// 🗑️ Recrear colección (útil para re-indexar todo desde cero)
export async function recreateCollection() {
    try {
        await client.collections(COLLECTION_NAME).delete();
        console.log(`🗑️  Typesense: colección "${COLLECTION_NAME}" eliminada`);
    } catch (_) { /* Si no existía, no importa */ }

    await client.collections().create(productsSchema);
    console.log(`🆕 Typesense: colección "${COLLECTION_NAME}" recreada`);
}