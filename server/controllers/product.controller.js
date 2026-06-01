import { postProductsInDB } from "../utils/post-products-db.js";

import xlsx from 'xlsx';
import _ from "lodash";
import Product from "../models/product.model.js";
import agendaModule from '../agenda.js'

//typesense
import client from "../typesense/client.js";
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

// Caché de subrubros intermedios (igual que antes)
let intermediateSubrubrosCache = new Set();
let lastCacheUpdate = 0;
const CACHE_TTL = 5 * 60 * 1000;

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
        const inIntermediate = await Product.exists({ desc_subrubro_intermedio: regex });
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
    const result = await client
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

async function typesenseMixedSearch(textQuery, codeQuery, filterBy, limit, page) {
    // fetchMore para tener suficientes candidatos al mergear
    const fetchLimit = parseInt(limit) * 4;

    const [textResult, codeResult] = await Promise.all([
        // Búsqueda 1: texto en campos descriptivos
        client.collections(COLLECTION_NAME).documents().search({
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
        client.collections(COLLECTION_NAME).documents().search({
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

    return {
        products: paginated.map(h => ({ ...h.document, _id: h.document.id })),
        total: merged.length,
        hasMore: start + limitInt < merged.length,
    };
}


// ─── Búsqueda con Typesense ──────────────────────────────────────────────────

/**
 * Convierte los filtros de MongoDB al formato filter_by de Typesense.
 * Typesense usa una sintaxis especial: "campo:=VALOR && campo2:>=100"
 */
// ─── Typesense: construir filtros ────────────────────────────────────────────

function buildTypesenseFilter(params = {}) {
    const parts = [];

    if (params.category)
        parts.push(`desc_rubro:=\`${params.category.toString().toUpperCase()}\``);

    if (params.brand)
        parts.push(`desc_marca:=\`${params.brand.toString().toUpperCase()}\``);

    if (params.subcategory) {
        // Typesense: OR entre ambos campos, sin necesidad de cache
        const sub = params.subcategory.toString().trim();
        parts.push(`(desc_subrub:=\`${sub}\` || desc_subrubro_intermedio:=\`${sub}\`)`);
    }

    if (!isNaN(params.minPrice) && !isNaN(params.maxPrice)) {
        parts.push(`precioimpre:[${params.minPrice}..${params.maxPrice}]`);
    } else if (!isNaN(params.minPrice)) {
        parts.push(`precioimpre:>=${params.minPrice}`);
    } else if (!isNaN(params.maxPrice)) {
        parts.push(`precioimpre:<=${params.maxPrice}`);
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

// ─── Controller principal ────────────────────────────────────────────────────

export const getProducts = async (req, res) => {
    try {
        const { search, limit = 10, lastId, page = 1, ...filters } = req.query;

        let products = [];
        let hasMore = false;
        let total = 0;

        if (search) {
            // ── BÚSQUEDA → Typesense ─────────────────────────────────────
            const decodedSearch = decodeURIComponent(search).trim();

            ({ products, total, hasMore } = await typesenseSearch(
                decodedSearch,
                filters,
                parseInt(limit),
                parseInt(page),
            ));

        } else {
            // ── BROWSE/FILTROS → MongoDB cursor pagination ────────────────
            // Sin búsqueda, Typesense no aporta nada sobre MongoDB.
            // Cursor pagination es más eficiente que offset para listas largas.
            const baseFilter = await buildBaseFilter(filters);

            let query = Product
                .find(baseFilter)
                .sort({ _id: 1 })
                .limit(parseInt(limit) + 1);

            if (lastId) query = query.where("_id").gt(lastId);

            const raw = await query.lean();
            hasMore = raw.length > parseInt(limit);
            products = hasMore ? raw.slice(0, -1) : raw;
            total = await Product.countDocuments(baseFilter);
        }

        return res.json({ success: true, products, hasMore, total });

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















export const getAllProducts = async (req, res) => {
    const { rubro } = req.params

    if (!rubro) {
        return res.status(400).json({ message: "El parámetro 'desc_rubro' es requerido" });
    }

    try {
        const products = await Product.find({ desc_rubro: rubro })
        res.status(200).json({ message: "Success getting all products from db", productsQuantity: products.length });
    } catch (err) {
        res.status(400).json({ message: "Error getting all products from db", err });
    }
}

export const getCategoriesAndSubcategories = async (req, res) => {
    try {
        const result = await Product.aggregate([
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
        ]);

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
            product,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error al obtener producto",
            error: err.message,
        });
    }
};

export const getHighlightedProducts = async (req, res) => {
    try {
        const products = await Product.find({ destacado: true })
        res.status(200).json({ success: true, message: `Success getting highlighted products`, products });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error getting highlighted products",
        });
    }
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
        const rubroPrincipal = req.body.rubro?.trim();
        const subrubroIntermedio = req.body.subrubroIntermedio?.trim() || null; // 👈 NUEVO

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
                desc_marca: item.desc_marca?.toString().trim(),
                porcen1: item.porcen1 !== undefined ? parseInt(item.porcen1) : undefined,
                precioimpre: item.precioimpre !== undefined ? item.precioimpre : undefined,
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
            },
            ...(invalidProducts.length > 0 && { erroresDetallados: invalidProducts.slice(0, 50) })
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
    const { agenda } = agendaModule;

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

        // Cancelar job anterior si existe
        if (product.highlightJobId) {
            await agenda.cancel({ _id: product.highlightJobId });
        }

        // Calcular fechas
        const ahora = new Date();
        const fechaFin = new Date();
        fechaFin.setDate(ahora.getDate() + days);

        // Crear job en Agenda
        const job = await agenda.schedule(
            fechaFin,
            'unhighlight-product',
            { productId: id }
        );

        // Actualizar producto
        const productUpdated = await Product.findOneAndUpdate(
            { codpro: id },
            {
                destacado: true,
                fechaDestacado: ahora,
                fechaFinDestacado: fechaFin,
                highlightJobId: job.attrs._id // Guardar referencia al job
            },
            { new: true }
        );

        // Programar desactivación automática (solo para demostración)
        /* setTimeout(async () => {
            await Product.updateOne(
                { codpro: id },
                { destacado: false }
            );
        }, days * 24 * 60 * 60 * 1000); */

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
    const { agenda } = agendaModule;

    try {
        // Verificar si el producto existe
        const product = await Product.findOne({ codpro: id });
        if (!product) return res.status(404).json({ success: false, message: `Producto con código ${id} no encontrado` });

        // Cancelar el job programado si existe
        if (product.highlightJobId) {
            await agenda.cancel({ _id: product.highlightJobId });
        }

        // Actualizar producto
        const productUpdated = await Product.findOneAndUpdate(
            { codpro: id },
            {
                $set: { destacado: false },
                $unset: { fechaFinDestacado: 1, highlightJobId: 1 }
            },
            { new: true }
        );

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

export const postProducts = async (req, res) => {
    try {
        const dataToPost = await postProductsInDB("./utils/json/inyeccion-sondas.json");
        const result = await Product.insertMany(dataToPost);

        console.log("Productos insertados correctamente");
        res.status(201).json({  // 201 Created es más apropiado para POST
            message: "Success posting products in MongoDB",
            insertedCount: result.length,
            data: result
        });
    } catch (err) {
        console.error("Error posting products:", err);
        res.status(500).json({  // 500 para errores del servidor
            message: "Error posting products in MongoDB",
            error: err.message
        });
    }
}

export const addFieldToProducts = async (req, res) => {
    try {
        const { field, value } = req.body
        if (!field) throw new Error("Campos 'field' y 'newField' son requeridos en el cuerpo de la solicitud.");

        const update = {};
        update[field] = value;

        //agrega el campo a todos los prods de la collection
        const updatedProducts = await Product.updateMany(
            {},  // Selecciona TODOS los productos
            { $set: update }  // Añade/modifica el campo
        );

        if (updatedProducts.acknowledged && updatedProducts.modifiedCount > 0) {
            res.status(200).json({ message: "Success adding field to all products in DB", updatedProducts });
        } else {
            res.status(200).json({ message: "No products were updated", updatedProducts });
        }
    } catch (err) {
        res.status(400).json({ message: "Error adding field to products in DB", err });
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

        res.status(200).json({ message: "Success changing product field", updatedProduct });
    } catch (err) {
        res.status(400).json({ message: "Error changing field to product in DB", err });
    }
}

export const changeFieldValueToProducts = async (req, res) => {
    try {
        const { field, value } = req.body
        if (!field || !value) throw new Error("Field does not exists")

        const missingFieldCount = await Product.countDocuments({ [field]: { $exists: false } });
        if (missingFieldCount > 0) throw new Error(`The field "${field}" is missing in ${missingFieldCount} documents`);

        const updateObject = { [field]: value };

        const updatedProducts = await Product.updateMany({}, { $set: updateObject });

        res.status(200).json({ message: "Success changing field name and its value", updatedProducts });
    } catch (err) {
        res.status(400).json({ message: "Error changing field name and its value", err });
    }
}

export const changeFieldToProducts = async (req, res) => {
    try {
        const { field, newField } = req.body
        if (!field) throw new Error("Field does not exists")

        const renameObject = {};
        renameObject[field] = newField;

        const updatedProducts = await Product.updateMany({}, { $rename: renameObject });

        res.status(200).json({ message: "Success changing field to products in DB", updatedProducts });
    } catch (err) {
        res.status(400).json({ message: "Error changing field to products in DB", err });
    }
}

export const deleteMongoDBCollection = async (req, res) => {
    try {
        await Product.deleteMany({})
        res.status(200).json({ message: "Success deleting mongo DB collection" });
    } catch (err) {
        res.status(400).json({ message: "Error deleting mongo DB collection", err });
    }
}

export const updateStock = async (req, res) => {
    try {
        const { productId } = req.params
        const { newStock } = req.body

        const prodFound = await Product.findById(productId);
        if (!prodFound) return res.status(404).json({ message: "Product not found in db" });

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { stock: prodFound.stock + Number(newStock) },
            { new: true } // Esto devuelve el documento actualizado
        );

        res.status(200).json({ message: "Success updating stock from product", updatedProduct });
    } catch (err) {
        res.status(400).json({ message: "Error deleting mongo DB collection", err });
    }
}

export const deleteProdsWithSubrub = async (req, res) => {
    const { subrub } = req.body;

    try {
        if (!subrub) {
            throw new Error("Subrub parameter is required");
        }

        const result = await Product.deleteMany({ desc_subrub: subrub });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: `No products found with subrub: ${subrub}`
            });
        }

        res.status(200).json({
            message: `Successfully deleted ${result.deletedCount} products with subrub: ${subrub}`
        });

    } catch (err) {
        res.status(400).json({
            message: `Error deleting products with subrub: ${subrub}`,
            error: err.message
        });
    }
}

export const deleteFieldFromProducts = async (req, res) => {
    try {
        const { field } = req.body
        if (!field) throw new Error("Field does not exists")

        const update = {};
        update[field] = "";

        const updatedProducts = await Product.updateMany({}, { $unset: update })

        res.status(200).json({ message: "Success deleting field from products", updatedProducts });
    } catch (err) {
        res.status(400).json({ message: "Error deleting field from products", err });
    }
}

export const deleteProdsByRubro = async (req, res) => {
    try {
        const { rubro } = req.params;
        if (!rubro) throw new Error("Field rubro is required");

        const result = await Product.deleteMany({ desc_rubro: rubro.toUpperCase() });

        res.status(200).json({
            message: `Deleted ${result.deletedCount} products with rubro ${rubro}`,
            deletedCount: result.deletedCount
        });
    } catch (err) {
        res.status(400).json({
            message: `Error deleting products`,
            error: err.message
        });
    }
};



//funcion para agregar la imagen de tornillos a todos los productos tornillos (bulones)
export const addImageToTornillos = async (req, res) => {
    try {
        const result = await Product.updateMany(
            { rubro: { $gte: 101, $lte: 103 } }, // filtro por rango
            { $set: { imageUrl: "https://res.cloudinary.com/dq7dwhqhh/image/upload/f_auto,q_auto,c_scale/v1755061135/bulones_by0zgv.png" } } // nuevo valor
        );

        res.status(200).json({
            message: "Imagen agregada a los productos con rubro entre 101 y 103",
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount
        });

    } catch (err) {
        res.status(400).json({ message: "Error trying to add image", error: err.message });
    }
};

export const changeImageurlProd = async (req, res) => {
    try {
        const { prodId } = req.params; // ID del producto desde la URL
        const { url } = req.body

        if (!prodId || !url) return res.status(400).json({ message: "Some paremeters may be empty" });

        const updatedProduct = await Product.findByIdAndUpdate(
            prodId, // filtro por _id
            { $set: { imageUrl: url } }, // cambio de valor
            { new: true } // devuelve el documento actualizado
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Producto no encontrado" });
        }

        res.status(200).json({
            message: "Imagen actualizada correctamente",
            product: updatedProduct
        });

    } catch (err) {
        res.status(400).json({ message: "Error to change image field", error: err.message });
    }
};

export const addImageUrlToSubrub = async (req, res) => {
    const { subrub, url } = req.body; // También necesitas recibir la URL

    try {
        if (!subrub || !url) return res.status(400).json({ message: "Some paremeters may be empty" });

        // Actualizar múltiples productos que coincidan con el subrubro
        const result = await Product.updateMany(
            { desc_subrub: subrub }, // Criterio de búsqueda
            { $set: { imageUrl: url } } // Campo a actualizar
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: `No products found with subrub: ${subrub}`
            });
        }

        res.status(200).json({
            message: `Successfully added image URL to ${result.modifiedCount} products with subrub: ${subrub}`,
            details: result
        });
    } catch (err) {
        res.status(500).json({
            message: `Error adding image url to subrub: ${subrub}`,
            error: err.message
        });
    }
}
