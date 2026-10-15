import xlsx from 'xlsx';
import _ from "lodash";
import Product from "../models/product.model.js";
import { stripPrices } from "../utils/priceVisibility.js";
import { isObjectIdString } from "../utils/validation.js";
import { createValueCache } from "../utils/memoCache.js";

const MAX_PAGE_SIZE = 50;

//typesense
import client, { searchClient } from "../typesense/client.js";
import { mongoToTypesense } from "../typesense/typesenseSync.js";
import { COLLECTION_NAME } from "../typesense/collection.js";

/* const MOTOR_GROUPS = {
    engranaje: [149, 147, 146, 151, 140, 139, 141, 142, 143, 144, 145, 150, 148],
    bulones: [101, 102, 103]
}; */

// product.controller.js  (versión con Typesense)
// ─────────────────────────────────────────────────────────────────────────────
// La API pública (/api/products) no cambia: el frontend funciona igual.
// Internamente, las búsquedas con ?search= usan Typesense;
// los filtros puros (categoría, marca, precio) siguen usando MongoDB directo
// porque son queries exactas que ya están bien indexadas.
// ─────────────────────────────────────────────────────────────────────────────
// ---------------------------
// BUSCADOR DE PRODUCTOS
// ---------------------------
// ─── Helpers ────────────────────────────────────────────────────────────────

function escapeRegex(s = "") {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─── Cachés del catálogo ────────────────────────────────────────────────────
// Datos que solo cambian al subir un Excel o destacar productos: se guardan en memoria para no
// repetir consultas a Mongo (~200 ms cada una con Atlas en São Paulo y Render en Oregon).
// Se invalidan al escribir (invalidateCatalogCaches) y además vencen solas por si la DB se edita
// por fuera de la API (scripts, Atlas).
const CATALOG_CACHE_TTL = 10 * 60 * 1000;

// Nombres de subrubros intermedios (en mayúsculas) para saber en qué campo filtrar una subcategoría
const intermediateSubrubrosCache = createValueCache(CATALOG_CACHE_TTL, async () =>
    new Set((await Product.distinct("desc_subrubro_intermedio"))
        .filter(Boolean).map(s => String(s).trim().toUpperCase())));

export function invalidateCatalogCaches() {
    intermediateSubrubrosCache.invalidate();
    categoriesCache.invalidate();
    highlightedCache.invalidate();
}

async function buildBaseFilter(params = {}) {
    const filter = {};

    if (params.category)
        filter.desc_rubro = params.category.toString().toUpperCase();

    if (params.brand)
        filter.desc_marca = params.brand.toString().toUpperCase();

    if (params.subcategory) {
        // Intentar match en desc_subrubro_intermedio primero, luego desc_subrub
        const raw = params.subcategory.toString().trim();
        const regex = { $regex: `^${escapeRegex(raw)}$`, $options: "i" };
        const inIntermediate = (await intermediateSubrubrosCache.get()).has(raw.toUpperCase());
        filter[inIntermediate ? "desc_subrubro_intermedio" : "desc_subrub"] = regex;
    }

    if (!isNaN(params.minPrice) || !isNaN(params.maxPrice)) {
        filter.precioimpre = {};
        if (!isNaN(params.minPrice)) filter.precioimpre.$gte = parseFloat(params.minPrice);
        if (!isNaN(params.maxPrice)) filter.precioimpre.$lte = parseFloat(params.maxPrice);
    }

    return filter;
}


// ─── Helpers de parsing ──────────────────────────────────────────────────────

function parseSearchTokens(searchTerm) {
    const tokens = searchTerm.trim().split(/\s+/);

    // Token de código: contiene dígitos (pure "0580314523" o mixto "ren06")
    const codeTokens = tokens.filter(t => /\d/.test(t));
    const textTokens = tokens.filter(t => !/\d/.test(t));

    return {
        textQuery: textTokens.join(" "),
        codeQuery: codeTokens.join(" "),
        isCodeOnly: textTokens.length === 0 && codeTokens.length > 0,
        isMixed: textTokens.length > 0 && codeTokens.length > 0,
        isTextOnly: textTokens.length > 0 && codeTokens.length === 0,
    };
}

// ─── Búsqueda simple (texto puro o código puro) ──────────────────────────────

async function typesenseSingleSearch({ q, queryBy, weights, infix, numTypos, prefix, filterBy, limit, page }) {
    const result = await searchClient
        .collections(COLLECTION_NAME)
        .documents()
        .search({
            q,
            query_by: queryBy,
            query_by_weights: weights,
            sort_by: "destacado:desc,_text_match:desc,precioimpre:asc",
            infix,
            num_typos: numTypos,
            prefix,
            per_page: parseInt(limit),
            page: parseInt(page),
            ...(filterBy && { filter_by: filterBy }),
        });

    return {
        hits: result.hits,
        found: result.found,
    };
}

// ─── Búsqueda mixta: texto + código ─────────────────────────────────────────
// Dos búsquedas en paralelo → los que matchean ambos van primero

// Máximo por request que acepta Typesense
const TYPESENSE_MAX_PER_PAGE = 250;

async function typesenseMixedSearch(textQuery, codeQuery, filterBy, limit, page) {
    // Candidatos de cada búsqueda para mergear: crece con la página pedida. Antes era fijo
    // (limit*4 = 40) y a partir de ~80 resultados el resto nunca aparecía en el scroll.
    const fetchLimit = Math.min(TYPESENSE_MAX_PER_PAGE, Math.max(limit * 4, page * limit * 2));

    const [textResult, codeResult] = await Promise.all([
        // Búsqueda 1: texto en campos descriptivos
        searchClient.collections(COLLECTION_NAME).documents().search({
            q: textQuery,
            query_by: "desc_stock,desc_marca,desc_subrub,desc_subrubro_intermedio,desc_rubro",
            query_by_weights: "5,3,3,3,2",
            sort_by: "destacado:desc,_text_match:desc,precioimpre:asc",
            num_typos: 1,
            prefix: true,
            per_page: fetchLimit,
            page: 1,
            ...(filterBy && { filter_by: filterBy }),
        }),

        // Búsqueda 2: código en codpro y codpro_suffix (infix)
        searchClient.collections(COLLECTION_NAME).documents().search({
            q: codeQuery,
            query_by: "codpro,codpro_suffix",
            infix: "always,always",
            num_typos: 0,
            prefix: false,
            per_page: fetchLimit,
            page: 1,
            ...(filterBy && { filter_by: filterBy }),
        }),
    ]);

    const textHits = textResult.hits || [];
    const codeHits = codeResult.hits || [];

    const codeIds = new Set(codeHits.map(h => h.document.id));
    const textIds = new Set(textHits.map(h => h.document.id));

    // Prioridad: matchea texto Y código > solo código > solo texto
    const bothMatch = textHits.filter(h => codeIds.has(h.document.id));
    const codeOnly = codeHits.filter(h => !textIds.has(h.document.id));
    const textOnly = textHits.filter(h => !codeIds.has(h.document.id));

    const merged = [...bothMatch, ...codeOnly, ...textOnly];

    // Paginar el resultado mergeado manualmente
    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const start = (pageInt - 1) * limitInt;
    const paginated = merged.slice(start, start + limitInt);

    // Si alguna búsqueda tiene más resultados que los candidatos traídos, la página siguiente
    // pide un pool más grande (hasta el máximo de Typesense)
    const truncated = fetchLimit < TYPESENSE_MAX_PER_PAGE && (textResult.found > fetchLimit || codeResult.found > fetchLimit);

    return {
        products: paginated.map(h => ({ ...h.document, _id: h.document.id })),
        // Unión de ambas búsquedas sin contar dos veces los que matchean las dos
        total: Math.max(merged.length, textResult.found + codeResult.found - bothMatch.length),
        hasMore: start + limitInt < merged.length || truncated,
    };
}


// ─── Búsqueda con Typesense ──────────────────────────────────────────────────

/**
 * Convierte los filtros de MongoDB al formato filter_by de Typesense.
 * Typesense usa una sintaxis especial: "campo:=VALOR && campo2:>=100"
 */
// ─── Typesense: construir filtros ────────────────────────────────────────────

// Los valores van entre backticks en filter_by: un backtick en el input cerraría el valor y
// permitiría inyectar condiciones (ej. sobre precioimpre), así que se eliminan.
const tsFilterValue = (v) => v.toString().replace(/`/g, "").trim();

function buildTypesenseFilter(params = {}) {
    const parts = [];

    if (params.category)
        parts.push(`desc_rubro:=\`${tsFilterValue(params.category).toUpperCase()}\``);

    if (params.brand)
        parts.push(`desc_marca:=\`${tsFilterValue(params.brand).toUpperCase()}\``);

    if (params.subcategory) {
        // Typesense: OR entre ambos campos, sin necesidad de cache
        const sub = tsFilterValue(params.subcategory);
        parts.push(`(desc_subrub:=\`${sub}\` || desc_subrubro_intermedio:=\`${sub}\`)`);
    }

    // Se interpolan números ya parseados, nunca el string original
    const minPrice = parseFloat(params.minPrice);
    const maxPrice = parseFloat(params.maxPrice);
    if (Number.isFinite(minPrice) && Number.isFinite(maxPrice)) {
        parts.push(`precioimpre:[${minPrice}..${maxPrice}]`);
    } else if (Number.isFinite(minPrice)) {
        parts.push(`precioimpre:>=${minPrice}`);
    } else if (Number.isFinite(maxPrice)) {
        parts.push(`precioimpre:<=${maxPrice}`);
    }

    return parts.length ? parts.join(" && ") : undefined;
}

// ─── Typesense: búsqueda full-text ──────────────────────────────────────────

async function typesenseSearch(searchTerm, params, limit, page = 1) {
    const filterBy = buildTypesenseFilter(params);
    const { textQuery, codeQuery, isCodeOnly, isMixed, isTextOnly } = parseSearchTokens(searchTerm);

    // ── Búsqueda mixta: "bomba de nafta 0580314523" ──────────────────────────
    if (isMixed) {
        return await typesenseMixedSearch(textQuery, codeQuery, filterBy, limit, page);
    }

    // ── Solo código: "0580314523", "ren06" ───────────────────────────────────
    if (isCodeOnly) {
        const { hits, found } = await typesenseSingleSearch({
            q: searchTerm,
            queryBy: "codpro,codpro_suffix",
            weights: "10,8",
            infix: "always,always",
            numTypos: 0,
            prefix: false,
            filterBy,
            limit,
            page,
        });

        return {
            products: hits.map(h => ({ ...h.document, _id: h.document.id })),
            total: found,
            hasMore: parseInt(page) * parseInt(limit) < found,
        };
    }

    // ── Solo texto: "bomba de nafta", "filtro aceite" ────────────────────────
    const { hits, found } = await typesenseSingleSearch({
        q: searchTerm,
        queryBy: "desc_stock,codpro,desc_marca,desc_subrub,desc_subrubro_intermedio,desc_rubro",
        weights: "5,4,3,3,3,2",
        infix: "off,off,off,off,off,off",
        numTypos: 1,
        prefix: true,
        filterBy,
        limit,
        page,
    });

    return {
        products: hits.map(h => ({ ...h.document, _id: h.document.id })),
        total: found,
        hasMore: parseInt(page) * parseInt(limit) < found,
    };
}

// ─── Respaldo: búsqueda en Mongo si Typesense falla ─────────────────────────
// Más simple que Typesense (sin tolerancia a errores de tipeo ni ranking por relevancia),
// pero mantiene el buscador funcionando. Cada palabra debe aparecer (como substring, sin
// distinguir mayúsculas) en el código o en alguna descripción. Con ~2000 productos el
// recorrido completo de la colección es rápido.
const FALLBACK_FIELDS = ["codpro", "desc_stock", "desc_marca", "desc_rubro", "desc_subrub", "desc_subrubro_intermedio"];

async function mongoFallbackSearch(searchTerm, params, limit, page) {
    const tokens = searchTerm.split(/\s+/).filter(Boolean).slice(0, 10);
    const tokenFilters = tokens.map(t => ({
        $or: FALLBACK_FIELDS.map(f => ({ [f]: { $regex: escapeRegex(t), $options: "i" } })),
    }));
    const filter = { $and: [await buildBaseFilter(params), ...tokenFilters] };

    const [raw, total] = await Promise.all([
        Product.find(filter).sort({ destacado: -1, codpro: 1 }).skip((page - 1) * limit).limit(limit + 1).lean(),
        Product.countDocuments(filter),
    ]);
    return { products: raw.slice(0, limit), total, hasMore: raw.length > limit };
}

// ─── Controller principal ────────────────────────────────────────────────────

export const getProducts = async (req, res) => {
    try {
        const { search, limit: rawLimit, lastId, page: rawPage, ...filters } = req.query;

        // Tope de página: sin él, limit=100000 devolvía todo el catálogo en una request
        const limit = Math.min(Math.max(parseInt(rawLimit) || 10, 1), MAX_PAGE_SIZE);
        const page = Math.max(parseInt(rawPage) || 1, 1);
        if (lastId !== undefined && !isObjectIdString(lastId)) {
            return res.status(400).json({ success: false, message: "lastId inválido" });
        }

        // Sin acceso a precios, filtrar por rango permitiría deducirlos
        if (!req.canSeePrices) {
            delete filters.minPrice;
            delete filters.maxPrice;
        }

        let products = [];
        let hasMore = false;
        let total = 0;
        let degraded = false; // true si la búsqueda vino del respaldo en Mongo

        if (search) {
            // ── BÚSQUEDA → Typesense ─────────────────────────────────────
            // Express ya decodifica la query: un segundo decodeURIComponent tiraba 500 con "%"
            const decodedSearch = String(search).trim();

            try {
                ({ products, total, hasMore } = await typesenseSearch(decodedSearch, filters, limit, page));
            } catch (tsErr) {
                // Typesense caído o lento (searchClient corta a los 2 s): se busca en Mongo
                console.error("⚠️ Typesense no disponible, búsqueda de respaldo en Mongo:", tsErr.message);
                ({ products, total, hasMore } = await mongoFallbackSearch(decodedSearch, filters, limit, page));
                degraded = true;
            }

        } else {
            // ── BROWSE/FILTROS → MongoDB cursor pagination ────────────────
            // Sin búsqueda, Typesense no aporta nada sobre MongoDB.
            // Cursor pagination es más eficiente que offset para listas largas.
            const baseFilter = await buildBaseFilter(filters);

            let query = Product
                .find(baseFilter)
                .sort({ _id: 1 })
                .limit(limit + 1);

            if (lastId) query = query.where("_id").gt(lastId);

            // El total solo en la primera página y en paralelo con el listado: antes era otra consulta
            // secuencial en cada página del scroll (~200 ms), y el frontend no lo usa al paginar
            const [raw, count] = await Promise.all([
                query.lean(),
                lastId ? null : Product.countDocuments(baseFilter),
            ]);
            hasMore = raw.length > limit;
            products = hasMore ? raw.slice(0, -1) : raw;
            total = count;
        }

        if (!req.canSeePrices) products = products.map(stripPrices);

        return res.json({ success: true, products, hasMore, total, ...(degraded && { degraded }) });

    } catch (err) {
        console.error("Error en getProducts:", err);
        res.status(500).json({
            success: false,
            message: "Error al obtener productos",
            error: process.env.NODE_ENV === "development" ? err.message : undefined,
        });
    }
};

// ─── Sync con Typesense (llamar desde create/update/delete) ─────────────────

export async function upsertToTypesense(mongoDoc) {
    try {
        await client
            .collections(COLLECTION_NAME)
            .documents()
            .upsert(mongoToTypesense(mongoDoc));
    } catch (err) {
        console.error("⚠️ Typesense upsert error:", err.message);
        // No propagar — MongoDB ya guardó, Typesense es secundario
    }
}

export async function deleteFromTypesense(mongoId) {
    try {
        await client
            .collections(COLLECTION_NAME)
            .documents(mongoId.toString())
            .delete();
    } catch (err) {
        console.error("⚠️ Typesense delete error:", err.message);
    }
}

const TYPESENSE_SYNC_BATCH = 500;

// Re-indexa en Typesense todos los productos de Mongo que matchean `filter`.
// Usar después de updateMany/bulkWrite. Nunca lanza: Mongo ya guardó.
export async function syncFilterToTypesense(filter) {
    let synced = 0;
    let failed = 0;
    let error = null;
    try {
        let lastId = null;
        while (true) {
            const query = lastId ? { $and: [filter, { _id: { $gt: lastId } }] } : filter;
            const batch = await Product.find(query).sort({ _id: 1 }).limit(TYPESENSE_SYNC_BATCH).lean();
            if (batch.length === 0) break;

            const results = await client
                .collections(COLLECTION_NAME)
                .documents()
                .import(batch.map(mongoToTypesense), { action: "upsert" });

            const errors = results.filter(r => !r.success);
            failed += errors.length;
            synced += batch.length - errors.length;
            if (errors.length > 0) console.error("⚠️ Typesense import errors:", errors.slice(0, 3));

            lastId = batch[batch.length - 1]._id;
        }
    } catch (err) {
        error = err.message;
        console.error("⚠️ Typesense sync error:", err.message);
    }
    return { synced, failed, error };
}

// Borra de Typesense los documentos con esos _id de Mongo (obtenerlos ANTES del deleteMany).
export async function deleteIdsFromTypesense(mongoIds) {
    try {
        for (let i = 0; i < mongoIds.length; i += TYPESENSE_SYNC_BATCH) {
            const ids = mongoIds.slice(i, i + TYPESENSE_SYNC_BATCH).map(id => id.toString());
            await client
                .collections(COLLECTION_NAME)
                .documents()
                .delete({ filter_by: `id:[${ids.join(",")}]` });
        }
    } catch (err) {
        console.error("⚠️ Typesense delete error:", err.message);
    }
}


// Árbol de rubros/subrubros para el menú del catálogo: una agregación sobre todo el catálogo que
// solo cambia al subir un Excel. Se calcula una vez y se reutiliza (ver invalidateCatalogCaches).
const categoriesCache = createValueCache(CATALOG_CACHE_TTL, () => Product.aggregate([
            // 1. Agrupar por rubro + subrubro intermedio + subrubro
            {
                $group: {
                    _id: {
                        rubro: "$desc_rubro",
                        subrubroIntermedio: "$desc_subrubro_intermedio",
                        subrubro: "$desc_subrub",
                        codigoSubrubro: "$subrub"
                    }
                }
            },

            // 2. Agrupar por rubro + subrubro intermedio
            {
                $group: {
                    _id: {
                        rubro: "$_id.rubro",
                        subrubroIntermedio: "$_id.subrubroIntermedio"
                    },
                    subrubros: {
                        $push: {
                            nombre: "$_id.subrubro",
                            codigo: "$_id.codigoSubrubro"
                        }
                    }
                }
            },

            // 3. Eliminar duplicados
            {
                $addFields: {
                    subrubros: {
                        $reduce: {
                            input: "$subrubros",
                            initialValue: [],
                            in: {
                                $cond: [
                                    {
                                        $in: [
                                            "$$this.codigo",
                                            { $map: { input: "$$value", as: "v", in: "$$v.codigo" } }
                                        ]
                                    },
                                    "$$value",
                                    { $concatArrays: ["$$value", ["$$this"]] }
                                ]
                            }
                        }
                    }
                }
            },

            // 4. Formatear subrubros como [nombre, codigo]
            {
                $addFields: {
                    subrubros: {
                        $map: {
                            input: "$subrubros",
                            as: "sub",
                            in: ["$$sub.nombre", "$$sub.codigo"]
                        }
                    }
                }
            },

            // 5. Agrupar todo por rubro
            {
                $group: {
                    _id: "$_id.rubro",
                    grupos: {
                        $push: {
                            subrubroIntermedio: "$_id.subrubroIntermedio",
                            subrubros: "$subrubros"
                        }
                    }
                }
            },

            // 6. Separar productos CON y SIN subrubro intermedio
            {
                $project: {
                    _id: 0,
                    rubro: "$_id",
                    subrubrosIntermedios: {
                        $cond: [
                            // Si ALGÚN grupo tiene subrubroIntermedio != null
                            {
                                $anyElementTrue: {
                                    $map: {
                                        input: "$grupos",
                                        as: "g",
                                        in: {
                                            $gt: [
                                                {
                                                    $strLenCP: {
                                                        $trim: {
                                                            input: { $ifNull: ["$$g.subrubroIntermedio", ""] }
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                }
                            },
                            // ENTONCES: devolver solo los grupos CON subrubroIntermedio
                            {
                                $filter: {
                                    input: {
                                        $map: {
                                            input: "$grupos",
                                            as: "g",
                                            in: {
                                                $cond: [
                                                    {
                                                        $gt: [
                                                            {
                                                                $strLenCP: {
                                                                    $trim: {
                                                                        input: { $ifNull: ["$$g.subrubroIntermedio", ""] }
                                                                    }
                                                                }
                                                            },
                                                            0
                                                        ]
                                                    },
                                                    {
                                                        nombre: "$$g.subrubroIntermedio",  // ✨ CLAVE: nombre
                                                        subrubros: "$$g.subrubros"
                                                    },
                                                    "$$REMOVE"
                                                ]
                                            }
                                        }
                                    },
                                    as: "item",
                                    cond: { $ne: ["$$item", "$$REMOVE"] }
                                }
                            },
                            // SI NO: null
                            null
                        ]
                    },
                    // Subrubros directos (si NO tiene intermedios)
                    subrubros: {
                        $cond: [
                            {
                                $anyElementTrue: {
                                    $map: {
                                        input: "$grupos",
                                        as: "g",
                                        in: {
                                            $gt: [
                                                {
                                                    $strLenCP: {
                                                        $trim: {
                                                            input: { $ifNull: ["$$g.subrubroIntermedio", ""] }
                                                        }
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                }
                            },
                            null,
                            {
                                $reduce: {
                                    input: "$grupos",
                                    initialValue: [],
                                    in: { $concatArrays: ["$$value", "$$this.subrubros"] }
                                }
                            }
                        ]
                    }
                }
            },

            // 7. Ordenar
            {
                $sort: { rubro: 1 }
            }
        ]));

export const getCategoriesAndSubcategories = async (req, res) => {
    try {
        const result = await categoriesCache.get();

        res.status(200).json({
            success: true,
            message: "Success getting categories with optional intermediate subcategories",
            categories: result
        });
    } catch (err) {
        console.error("Error in getCategoriesAndSubcategories:", err);
        res.status(500).json({
            success: false,
            message: "Error getting categories",
            error: err.message
        });
    }
};


export const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findOne({ codpro: id });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: `Producto con ID ${id} no encontrado`,
            });
        }

        res.status(200).json({
            success: true,
            message: `Success getting product by id: ${id}`,
            product: req.canSeePrices ? product : stripPrices(product),
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error al obtener producto",
            error: err.message,
        });
    }
};

// Destacados (se piden en cada visita al catálogo). Se invalida al destacar/quitar destacado,
// al subir un Excel (cambian precios) y cuando el job horario vence destacados.
const highlightedCache = createValueCache(CATALOG_CACHE_TTL, () =>
    Product.find({ destacado: true }).lean());

export const getHighlightedProducts = async (req, res) => {
    try {
        // Filtra por fecha en cada request (no al cachear): un destacado vencido no se muestra aunque el
        // job horario todavía no lo haya apagado (sin fecha de fin = destacado manual sin vencimiento)
        const now = new Date();
        const products = (await highlightedCache.get())
            .filter(p => !p.fechaFinDestacado || new Date(p.fechaFinDestacado) > now);
        res.status(200).json({
            success: true,
            message: `Success getting highlighted products`,
            products: req.canSeePrices ? products : products.map(stripPrices)
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error getting highlighted products",
        });
    }
}

const VALID_BRANDS = Product.schema.path("desc_marca").enumValues;

// Precio de una celda de Excel: número si la celda es numérica; si es texto, solo se acepta
// "1500" o "1500.50" (un texto como "1.500,50" es ambiguo y se rechaza para no guardar un precio mal)
function parseExcelPrice(raw, text) {
    if (typeof raw === "number") return raw;
    const s = String(text ?? raw ?? "").trim();
    return /^\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
}

export const uploadExcelProducts = async (req, res) => {
    const timers = {
        total: 'TiempoTotalCarga',
        lectura: 'LecturaExcel',
        consulta: 'ConsultaExistente',
        procesamiento: 'ProcesamientoDatos',
        operaciones: 'OperacionesDB'
    };

    try {
        console.time(timers.total);

        // 1. Validar archivo
        if (!req.file) {
            return res.status(400).json({ message: "No se subió ningún archivo" });
        }

        // 2. Obtener datos del formulario
        // Siempre en mayúsculas: los filtros del catálogo comparan desc_rubro en mayúsculas
        const rubroPrincipal = req.body.rubro?.trim().toUpperCase();
        const subrubroIntermedio = req.body.subrubroIntermedio?.trim().toUpperCase() || null;

        if (!rubroPrincipal) {
            return res.status(400).json({ message: "El rubro principal es requerido" });
        }

        console.time(timers.lectura);
        const workbook = xlsx.read(req.file.buffer, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelItems = xlsx.utils.sheet_to_json(worksheet, {
            defval: undefined,
            raw: false,
            dateNF: 'yyyy-mm-dd'
        });
        // Mismas filas con el valor crudo de cada celda: el precio se toma de acá cuando la celda es
        // numérica (con raw:false llega como texto formateado, ej. "1,500.00", y antes la fila se perdía al castear)
        const rawItems = xlsx.utils.sheet_to_json(worksheet, { defval: undefined, raw: true });
        console.timeEnd(timers.lectura);

        // 3. Configuración
        const REQUIRED_FIELDS = [
            'codpro', 'desc_stock', 'rubro',
            'subrub', 'proveed', 'desc_subrub',
            'desc_marca', 'porcen1', 'precioimpre'
        ];

        // 4. Obtener productos existentes
        console.time(timers.consulta);
        const allCodpros = excelItems.map(item => item.codpro?.toString().trim()).filter(Boolean);
        const existingProducts = await Product.find({
            codpro: { $in: allCodpros }
        }).lean();
        const existingProductsMap = new Map(existingProducts.map(p => [p.codpro, p]));
        console.timeEnd(timers.consulta);

        // 5. Procesamiento
        const BATCH_SIZE = 1000;
        let productsToUpsert = [];
        let invalidProducts = [];
        const movedProducts = [];

        console.time(timers.procesamiento);
        for (let i = 0; i < excelItems.length; i++) {
            const item = excelItems[i];
            const rowNumber = i + 2;

            const codpro = item.codpro?.toString().trim();
            if (!codpro) {
                invalidProducts.push(`Fila ${rowNumber}: codpro es requerido`);
                continue;
            }

            const existingProduct = existingProductsMap.get(codpro);

            // Mapeo con NUEVA jerarquía de 3 niveles
            const mappedItem = {
                codpro,
                desc_stock: item.desc_stock?.toString().trim(),

                // NIVEL 1: Rubro principal (del form)
                desc_rubro: rubroPrincipal,

                // NIVEL 2: Subrubro intermedio (del form, opcional) 👈 NUEVO
                desc_subrubro_intermedio: subrubroIntermedio || null,

                // NIVEL 3: Subrubro final (del Excel)
                subrub: item.rubro !== undefined ? parseInt(item.rubro) : undefined,
                desc_subrub: item.desc_rubro?.toString().trim(),

                // Resto de campos
                rubro: item.subrub !== undefined ? parseInt(item.subrub) : undefined,
                proveed: item.proveed !== undefined ? parseInt(item.proveed) : undefined,
                desc_marca: item.desc_marca?.toString().trim().toUpperCase(),
                porcen1: item.porcen1 !== undefined ? parseInt(item.porcen1) : undefined,
                precioimpre: item.precioimpre !== undefined ? parseExcelPrice(rawItems[i]?.precioimpre, item.precioimpre) : undefined,
                stock: 10,
                imageUrl: existingProduct?.imageUrl || null,
                lastUpdated: new Date()
            };

            // Validación de campos requeridos
            const isComplete = REQUIRED_FIELDS.every(field => {
                const val = mappedItem[field];
                return val !== undefined && val !== null && val !== '';
            });

            if (!isComplete) {
                const missingFields = REQUIRED_FIELDS.filter(f =>
                    !mappedItem[f] && mappedItem[f] !== 0
                );
                invalidProducts.push(`Fila ${rowNumber}: Faltan campos (${missingFields.join(', ')})`);
                continue;
            }

            // Validaciones de valores: antes estas filas se descartaban en silencio (bulkWrite no valida
            // el enum y omite las que fallan al castear) o se guardaban con datos inválidos
            // campo interno -> columna del Excel (rubro y subrub vienen intercambiados en el mapeo)
            const EXCEL_COLUMN = { rubro: 'subrub', subrub: 'rubro', proveed: 'proveed', porcen1: 'porcen1' };
            const notNumeric = Object.keys(EXCEL_COLUMN).filter(f => Number.isNaN(mappedItem[f]));
            if (notNumeric.length) {
                invalidProducts.push(`Fila ${rowNumber} (${codpro}): valores no numéricos en la columna ${notNumeric.map(f => EXCEL_COLUMN[f]).join(', ')}`);
                continue;
            }
            if (!(mappedItem.precioimpre > 0)) {
                invalidProducts.push(`Fila ${rowNumber} (${codpro}): precio inválido (${JSON.stringify(item.precioimpre)})`);
                continue;
            }
            if (!VALID_BRANDS.includes(mappedItem.desc_marca)) {
                invalidProducts.push(`Fila ${rowNumber} (${codpro}): marca "${mappedItem.desc_marca}" no está en la lista permitida`);
                continue;
            }

            // El upsert es por codpro: si el producto existía en otro rubro, esta carga lo mueve
            if (existingProduct && existingProduct.desc_rubro !== rubroPrincipal) {
                movedProducts.push(`${codpro}: ${existingProduct.desc_rubro} → ${rubroPrincipal}`);
            }

            productsToUpsert.push(mappedItem);
        }
        console.timeEnd(timers.procesamiento);

        // 6. Operaciones DB
        console.time(timers.operaciones);
        const results = {
            insertedCount: 0,
            modifiedCount: 0,
            unchangedCount: 0
        };

        for (let i = 0; i < productsToUpsert.length; i += BATCH_SIZE) {
            const batch = productsToUpsert.slice(i, i + BATCH_SIZE);

            const bulkOps = batch.map(item => ({
                updateOne: {
                    filter: { codpro: item.codpro },
                    update: {
                        $set: _.omit(item, ['codpro']),
                        $setOnInsert: { createdAt: new Date() }
                    },
                    upsert: true
                }
            }));

            const batchResult = await Product.bulkWrite(bulkOps, {
                ordered: false,
                writeConcern: { w: 1 }
            });

            results.insertedCount += batchResult.upsertedCount;
            results.modifiedCount += batchResult.modifiedCount;
            results.unchangedCount += (batch.length - batchResult.modifiedCount - batchResult.upsertedCount);
        }
        console.timeEnd(timers.operaciones);

        // 7. Reflejar los cambios en el buscador (Typesense)
        // Cambian rubros, subrubros y precios: el menú y los destacados en caché quedan viejos
        invalidateCatalogCaches();
        const typesenseResult = await syncFilterToTypesense({
            codpro: { $in: productsToUpsert.map(p => p.codpro) }
        });
        console.timeEnd(timers.total);

        res.json({
            message: 'Carga completada',
            details: {
                totalRegistros: excelItems.length,
                registrosValidos: productsToUpsert.length,
                nuevosInsertados: results.insertedCount,
                actualizados: results.modifiedCount,
                sinCambios: results.unchangedCount,
                errores: invalidProducts.length,
                movidosDeRubro: movedProducts.length,
                sincronizadosBuscador: typesenseResult.synced,
                erroresBuscador: typesenseResult.failed,
            },
            ...(typesenseResult.error && { errorBuscador: typesenseResult.error }),
            ...(invalidProducts.length > 0 && { erroresDetallados: invalidProducts.slice(0, 50) }),
            ...(movedProducts.length > 0 && { movidosDetallados: movedProducts.slice(0, 50) })
        });

    } catch (err) {
        console.error("Error en upload-excel:", err);
        res.status(500).json({
            message: "Error en carga",
            ...(process.env.NODE_ENV === 'development' && {
                error: err.message,
                stack: err.stack
            })
        });
    }
};

export const downloadExcelProducts = async (req, res) => {
    try {
        console.log('=== INICIO downloadExcelProducts ===');
        const { rubro } = req.query;
        console.log('Rubro recibido:', rubro);

        // Validar que se envió el rubro
        if (!rubro || rubro.trim() === '') {
            console.log('ERROR: Rubro vacío');
            return res.status(400).json({
                message: "El parámetro 'rubro' es requerido"
            });
        }

        const rubroTrimmed = rubro.trim();
        console.log('Rubro limpio:', rubroTrimmed);

        // BÚSQUEDA EXACTA (case-insensitive)
        console.log('Buscando en DB con desc_rubro...');
        const products = await Product.find({
            desc_rubro: { $regex: new RegExp(`^${rubroTrimmed}$`, 'i') }
        })
            .select('codpro desc_stock desc_subrub precioimpre')
            .lean();

        console.log('Productos encontrados:', products.length);

        // Validar si hay productos
        if (!products || products.length === 0) {
            console.log('ERROR: No se encontraron productos');

            // Debug: Ver qué rubros existen en la DB
            const existingRubros = await Product.distinct('desc_rubro');
            console.log('Rubros disponibles en DB:', existingRubros);

            return res.status(404).json({
                message: `No se encontraron productos para el rubro: "${rubroTrimmed}"`,
                rubro: rubroTrimmed,
                encontrados: 0,
                rubrosDisponibles: existingRubros.slice(0, 10) // Primeros 10 para referencia
            });
        }

        console.log('Generando Excel con', products.length, 'productos');

        // Formatear datos para el Excel
        const excelData = products.map(product => ({
            codpro: product.codpro || '',
            desc_stock: product.desc_stock || '',
            desc_subrub: product.desc_subrub || '',
            precioimpre: product.precioimpre !== undefined ? product.precioimpre : '',
        }));

        console.log('Datos formateados:', excelData.length, 'filas');
        console.log('Primera fila:', excelData[0]);

        // Crear el worksheet
        const worksheet = xlsx.utils.json_to_sheet(excelData);

        // Crear el workbook
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Productos');

        // Ajustar anchos de columna
        worksheet['!cols'] = [
            { wch: 15 }, // codpro
            { wch: 40 }, // desc_stock
            { wch: 20 }, // desc_subrub
            { wch: 15 }, // precioimpre
        ];

        console.log('Generando buffer del archivo...');

        // Generar el buffer
        const excelBuffer = xlsx.write(workbook, {
            type: 'buffer',
            bookType: 'xlsx'
        });

        console.log('Buffer generado, tamaño:', excelBuffer.length, 'bytes');

        // Crear nombre de archivo seguro
        const safeRubro = rubroTrimmed.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `productos_${safeRubro}_${new Date().toISOString().split('T')[0]}.xlsx`;

        console.log('Nombre del archivo:', filename);

        // Configurar headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', excelBuffer.length);
        res.setHeader('Cache-Control', 'no-cache');

        console.log('Enviando archivo...');
        console.log('=== FIN downloadExcelProducts ===');

        // Enviar buffer
        return res.end(excelBuffer);

    } catch (err) {
        console.error("❌ ERROR en download-excel:", err);
        console.error("Stack:", err.stack);

        return res.status(500).json({
            message: "Error al generar el archivo Excel",
            error: err.message,
            ...(process.env.NODE_ENV === 'development' && {
                stack: err.stack
            })
        });
    }
};

export const highlightProduct = async (req, res) => {
    const { id } = req.params; // Cambia "id" por "codigo"
    const { days } = req.body

    // Entero 1..365: un string ("3") hacía setDate(getDate() + "3") por concatenación y daba fechas absurdas
    if (!Number.isInteger(days) || days < 1 || days > 365) {
        return res.status(400).json({ success: false, message: "Los días deben ser un entero entre 1 y 365" });
    }

    try {
        const product = await Product.findOne({ codpro: id });
        if (!product) return res.status(404).json({ success: false, message: `Producto con código ${id} no encontrado` });

        // Si ya está destacado y no ha expirado
        if (product.destacado && product.fechaFinDestacado > new Date()) {
            return res.status(409).json({
                success: false,
                message: `El producto ya está destacado hasta ${product.fechaFinDestacado.toLocaleDateString()}`,
                product,
                isAlreadyHighlighted: true
            });
        }

        const ahora = new Date();
        const fechaFin = new Date(ahora.getTime() + days * 24 * 60 * 60 * 1000);

        // El vencimiento lo aplica jobs/maintenance.js (expireHighlights) a partir de fechaFinDestacado
        const productUpdated = await Product.findOneAndUpdate(
            { codpro: id },
            {
                $set: { destacado: true, fechaDestacado: ahora, fechaFinDestacado: fechaFin },
                $unset: { highlightJobId: 1 }
            },
            { new: true }
        );
        invalidateCatalogCaches();
        await upsertToTypesense(productUpdated);

        res.status(200).json({
            success: true,
            message: `Producto destacado hasta ${fechaFin.toLocaleDateString()}`,
            product: productUpdated
        });
    } catch (err) {
        console.error("Error al destacar producto:", err);
        res.status(500).json({
            message: "Error al destacar producto",
            error: err.message
        });
    }
}

export const unhighlightProduct = async (req, res) => {
    const { id } = req.params

    try {
        // Verificar si el producto existe
        const product = await Product.findOne({ codpro: id });
        if (!product) return res.status(404).json({ success: false, message: `Producto con código ${id} no encontrado` });

        // Actualizar producto
        const productUpdated = await Product.findOneAndUpdate(
            { codpro: id },
            {
                $set: { destacado: false },
                $unset: { fechaFinDestacado: 1, highlightJobId: 1 }
            },
            { new: true }
        );
        invalidateCatalogCaches();
        await upsertToTypesense(productUpdated);

        res.status(200).json({
            success: true,
            message: `Producto dejó de estar destacado manualmente`,
            product: productUpdated
        });
    } catch (err) {
        console.error("Error al quitar destacado:", err);
        res.status(500).json({
            success: false,
            message: "Error interno al quitar destacado",
            error: err.message
        })
    }
}


export const changeProductFieldVal = async (req, res) => {
    try {
        const { prodId } = req.params
        const { field, value } = req.body
        if (!field || !value) throw new Error("Field does not exists")

        const prodFound = await Product.findById(prodId);      //busca si existe el producto en la db
        if (!prodFound) return res.status(404).json({ message: "Product not found in db" });

        const fieldExists = await Product.findOne({ _id: prodId, [field]: { $exists: true } });    //busca si existe el campo del producto en la db
        if (!fieldExists) return res.status(400).json({ message: `Field '${field}' does not exist in the document` });

        const updateData = { [field]: value };

        const updatedProduct = await Product.findByIdAndUpdate(
            prodId,
            updateData,
            { new: true }
        );

        if (!updatedProduct) return res.status(500).json({ message: "Error renaming field in DB" });
        invalidateCatalogCaches();
        await upsertToTypesense(updatedProduct);

        res.status(200).json({ message: "Success changing product field", updatedProduct });
    } catch (err) {
        res.status(400).json({ message: "Error changing field to product in DB", err });
    }
}


