import { postProductsInDB } from "../utils/post-products-db.js";
/* import Producto from "../models/product.model.js"; */
import cache from "memory-cache";
import { getSubcategory, getSubcategoryIdsForGroup } from "../utils/getSubcategories.js"
import xlsx from 'xlsx';
import _ from "lodash";
import Product from "../models/product.model.js";
import agendaModule from '../agenda.js'

/* export const getProducts = async (req, res) => {
    try {
        const { 
            limit = 10, 
            lastId, 
            category, 
            subcategory, 
            categories, 
            brand, 
            minPrice, 
            maxPrice, 
            search 
        } = req.query;

        const cacheKey = JSON.stringify(req.query);
        const cachedData = cache.get(cacheKey);
        if (cachedData) return res.json(cachedData);

        // Construir filtro
        const filter = {};
        
        // Filtros exactos
        if (category) filter.desc_rubro = category.toUpperCase();
        if (brand) filter.desc_marca = brand.toUpperCase();
        
        // Manejo mejorado de subcategorías
        if (subcategory || categories) {
            const subcat = subcategory || categories;
            
            if (["bulones", "engranaje"].includes(subcat)) {
                const subrubrosIds = getSubcategoryIdsForGroup(subcat);
                if (subrubrosIds && subrubrosIds.length > 0) {
                    filter.rubro = { $in: subrubrosIds };
                }
            } else {
                // Caso normal para subcategorías directas
                filter.desc_subrub = subcat.toUpperCase();
            }
        }

        // Rango de precios
        if (!isNaN(minPrice) || !isNaN(maxPrice)) {
            filter.precioimpre = {};
            if (!isNaN(minPrice)) filter.precioimpre.$gte = parseFloat(minPrice);
            if (!isNaN(maxPrice)) filter.precioimpre.$lte = parseFloat(maxPrice);
        }
        
        // Búsqueda de texto (usando el índice)
        if (search) {
            const decodedSearch = decodeURIComponent(search);
            
            // Opción 1: Búsqueda con índice de texto (mejor para relevancia)
            filter.$text = { $search: decodedSearch };
        }
            
         // Consulta modificada
         let query = Product.find(filter)
            .sort({ _id: 1 }) // Orden consistente siempre
            .limit(parseInt(limit) + 1); // Pide 1 más
        
        if (lastId) {
            query = query.where('_id').gt(lastId);
        }

        // Si usas búsqueda de texto, añade scoring
        if (search && filter.$text) {
            query.sort({ 
              score: { $meta: "textScore" },
              _id: 1 // Mantener orden consistente
            });
          }

          const products = await query.exec();
          const hasMore = products.length > parseInt(limit);
          const productsToSend = hasMore ? products.slice(0, -1) : products;

          const response = {
            success: true,
            products: productsToSend,
            hasMore,
            total: await Product.countDocuments(filter)
        };

        cache.put(cacheKey, response, 300000); // 5 minutos
        res.json(response);

    } catch (err) {
        console.error('Error en getProducts:', err);
        res.status(500).json({
            success: false,
            message: "Error al obtener productos",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
} */


// Búsqueda combinada para texto y números

// Función principal del controlador
export const getProducts = async (req, res) => {
    try {
        const { search, limit = 10, lastId, ...otherParams } = req.query;
        const cacheKey = JSON.stringify(req.query);

        // Limpiar caché si hay búsqueda nueva
        if (search) cache.del(cacheKey);
        else if (cache.get(cacheKey)) return res.json(cache.get(cacheKey));

        // Construir filtro base
        const baseFilter = buildBaseFilter(otherParams);

        // Búsqueda inteligente
        let products = [];
        if (search) {
            const decodedSearch = decodeURIComponent(search).trim();
            const { textParts, numericParts } = analyzeSearchTerm(decodedSearch);
            products = await combinedSearch(baseFilter, textParts, numericParts, { limit, lastId });
        } else {
            products = await executeProductQuery(baseFilter, limit, lastId, false);
        }

        // Preparar respuesta
        const hasMore = products.length > parseInt(limit);
        const response = {
            success: true,
            products: hasMore ? products.slice(0, -1) : products,
            hasMore,
            total: await Product.countDocuments(baseFilter)
        };

        cache.put(cacheKey, response, 300000); // 5 minutos de caché
        return res.json(response);

    } catch (err) {
        console.error('Error en getProducts:', err);
        res.status(500).json({
            success: false,
            message: "Error al obtener productos",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// FUNCIONES AUXILIARES - getProducts
function buildBaseFilter(params) {
    const filter = {};

    // Filtros exactos
    if (params.category) filter.desc_rubro = params.category.toUpperCase();
    if (params.brand) filter.desc_marca = params.brand.toUpperCase();

    // Manejo de subcategorías
    if (params.subcategory || params.categories) {
        const subcat = params.subcategory || params.categories;

        if (["bulones", "engranaje"].includes(subcat)) {
            const subrubrosIds = getSubcategoryIdsForGroup(subcat);
            if (subrubrosIds?.length > 0) {
                filter.rubro = { $in: subrubrosIds };
            }
        } else {
            filter.desc_subrub = subcat.toUpperCase();
        }
    }

    // Rango de precios
    if (!isNaN(params.minPrice) || !isNaN(params.maxPrice)) {
        filter.precioimpre = {};
        if (!isNaN(params.minPrice)) filter.precioimpre.$gte = parseFloat(params.minPrice);
        if (!isNaN(params.maxPrice)) filter.precioimpre.$lte = parseFloat(params.maxPrice);
    }

    return filter;
}

async function combinedSearch(baseFilter, textParts, numericParts, params) {
    const filters = [];

    // Estrategia 1: Búsqueda por código exacto o parcial
    if (numericParts.length > 0) {
        filters.push({
            ...baseFilter,
            codpro: { $regex: `^${numericParts.join('|^')}`, $options: 'i' }
        });
    }

    // Estrategia 2: Búsqueda textual
    if (textParts.length > 0) {
        const textSearch = textParts.join(' ');

        // 2a. Búsqueda exacta de frase
        filters.push({
            ...baseFilter,
            $text: { $search: `"${textSearch}"` }
        });

        // 2b. Búsqueda AND de términos
        filters.push({
            ...baseFilter,
            $text: { $search: textParts.map(p => `"${p}"`).join(' ') }
        });

        // 2c. Búsqueda OR estándar
        filters.push({
            ...baseFilter,
            $text: { $search: textSearch }
        });
    }

    // Probar todas las estrategias en orden
    for (const filter of filters) {
        const results = await executeProductQuery(filter, params.limit, params.lastId, !!filter.$text);
        if (results.length > 0) return results;
    }

    // Fallback final: búsqueda por campos individuales
    const regexConditions = [];

    if (numericParts.length > 0) {
        regexConditions.push({
            $or: [
                { codpro: { $regex: numericParts.join('|'), $options: 'i' } },
                { desc_stock: { $regex: numericParts.join('|'), $options: 'i' } }
            ]
        });
    }

    if (textParts.length > 0) {
        regexConditions.push({
            $or: [
                { desc_stock: { $regex: textParts.join('|'), $options: 'i' } },
                { desc_marca: { $regex: textParts.join('|'), $options: 'i' } },
                { desc_rubro: { $regex: textParts.join('|'), $options: 'i' } },
                { desc_subrub: { $regex: textParts.join('|'), $options: 'i' } }
            ]
        });
    }

    const finalFilter = {
        ...baseFilter,
        $and: regexConditions
    };

    return await executeProductQuery(finalFilter, params.limit, params.lastId, false);
}

function analyzeSearchTerm(term) { // Función para analizar el término de búsqueda
    const parts = term.split(/\s+/);
    const textParts = [];
    const numericParts = [];

    parts.forEach(part => {
        // Verificamos si la parte es numérica (aunque codpro sea String)
        /^\d+$/.test(part) ? numericParts.push(part) : textParts.push(part);
    });

    return { textParts, numericParts };
}

async function executeProductQuery(filter, limit, lastId, isTextSearch) {
    let query = Product.find(filter);

    if (isTextSearch) {
        query = query.sort({ score: { $meta: "textScore" }, _id: 1 })
            .select({ score: { $meta: "textScore" } });
    } else {
        query = query.sort({ _id: 1 });
    }

    query = query.limit(parseInt(limit) + 1);

    if (lastId) {
        query = query.where('_id').gt(lastId);
    }

    return await query.exec();
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
            // Primero agrupamos para obtener combinaciones únicas de rubro/subrubro
            {
                $group: {
                    _id: {
                        rubro: "$desc_rubro",
                        subrubro: "$desc_subrub",
                        codigo: "$rubro"
                    }
                }
            },
            // Luego agrupamos por rubro para juntar todos sus subrubros
            {
                $group: {
                    _id: "$_id.rubro",
                    subrubros: {
                        $push: {
                            nombre: "$_id.subrubro",
                            codigo: "$_id.codigo"
                        }
                    }
                }
            },
            // Eliminamos duplicados de subrubros (por si acaso)
            {
                $addFields: {
                    subrubros: {
                        $reduce: {
                            input: "$subrubros",
                            initialValue: [],
                            in: {
                                $cond: [
                                    { $in: ["$$this", "$$value"] },
                                    "$$value",
                                    { $concatArrays: ["$$value", ["$$this"]] }
                                ]
                            }
                        }
                    }
                }
            },
            // Formateamos la salida como necesitas
            {
                $project: {
                    _id: 0,
                    rubro: "$_id",
                    subrubros: {
                        $map: {
                            input: "$subrubros",
                            as: "sub",
                            in: [
                                "$$sub.nombre", // Nombre del subrubro
                                "$$sub.codigo"  // Código del subrubro
                            ]
                        }
                    }
                }
            },
            // Ordenamos alfabéticamente por rubro
            {
                $sort: { rubro: 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            message: "Success getting categories with subrubros and codes",
            categories: result
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error getting categories with subrubros and codes",
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
    // Objeto para manejar los timers
    const timers = {
        total: 'TiempoTotalCarga',
        lectura: 'LecturaExcel',
        consulta: 'ConsultaExistente',
        procesamiento: 'ProcesamientoDatos',
        operaciones: 'OperacionesDB'
    };

    try {
        console.time(timers.total); // Medición de tiempo total

        // 1. Validar archivo
        if (!req.file) {
            return res.status(400).json({ message: "No se subió ningún archivo" });
        }

        console.time(timers.lectura);
        // 2. Leer archivo Excel optimizado
        const workbook = xlsx.read(req.file.buffer, { type: "array" }); // Más rápido que 'buffer'
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const excelItems = xlsx.utils.sheet_to_json(worksheet, {
            defval: undefined, // Mejor que null para nuestro caso
            raw: false,       // Conversión automática de valores
            dateNF: 'yyyy-mm-dd'
        });
        console.timeEnd(timers.lectura);

        // 3. Configuración
        const REQUIRED_FIELDS = [
            'codpro', 'desc_stock', 'rubro',
            'subrub', 'proveed', 'desc_subrub',
            'desc_marca', 'porcen1', 'precioimpre'
        ];

        // 4. Obtener todos los códigos existentes en una sola consulta
        console.time(timers.consulta);
        const allCodpros = excelItems.map(item => item.codpro?.toString().trim()).filter(Boolean);
        const existingProducts = await Product.find({
            codpro: { $in: allCodpros }
        }).lean();
        const existingProductsMap = new Map(existingProducts.map(p => [p.codpro, p]));
        console.timeEnd(timers.consulta);

        // 5. Procesamiento optimizado por lotes
        const BATCH_SIZE = 1000; // Ajustar según necesidad
        let productsToUpsert = [];
        let invalidProducts = [];

        console.time(timers.procesamiento);
        for (let i = 0; i < excelItems.length; i++) {
            const item = excelItems[i];
            const rowNumber = i + 2;

            // Validación de codpro
            const codpro = item.codpro?.toString().trim();
            if (!codpro) {
                invalidProducts.push(`Fila ${rowNumber}: codpro es requerido`);
                continue;
            }

            // Obtener producto existente del mapa
            const existingProduct = existingProductsMap.get(codpro);

            // Mapeo optimizado de campos
            const mappedItem = {
                codpro,
                desc_stock: item.desc_stock?.toString().trim(),
                rubro: item.rubro !== undefined ? parseInt(item.rubro) : undefined,
                subrub: item.subrub !== undefined ? parseInt(item.subrub) : undefined,
                proveed: item.proveed !== undefined ? parseInt(item.proveed) : undefined,
                desc_rubro: req.body.rubro,
                desc_subrub: item.desc_rubro?.toString().trim(),
                desc_marca: item.desc_marca?.toString().trim(),
                porcen1: item.porcen1 !== undefined ? parseInt(item.porcen1) : undefined,
                precioimpre: item.precioimpre !== undefined ? item.precioimpre : undefined,
                /* destacado: existingProduct?.destacado || false, */
                stock: existingProduct?.stock || 0,
                lastUpdated: new Date()
            };

            // Verificación de campos requeridos optimizada
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

        // 6. Procesamiento por lotes para operaciones de BD
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
                writeConcern: { w: 1 } // Balance entre velocidad y confirmación
            });

            results.insertedCount += batchResult.upsertedCount;
            results.modifiedCount += batchResult.modifiedCount;
            results.unchangedCount += (batch.length - batchResult.modifiedCount - batchResult.upsertedCount);
        }
        console.timeEnd(timers.operaciones);

        console.timeEnd(timers.total); // Fin medición tiempo total

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
            ...(invalidProducts.length > 0 && { erroresDetallados: invalidProducts.slice(0, 50) }) // Limitar salida
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
}

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



//funcion para agregar la imagen de tornillos a todos los productos tornillos (bulones)
export const addImageToTornillos = async (req, res) => {
    try {
        const result = await Product.updateMany(
            { rubro: { $gte: 101, $lte: 103 } }, // filtro por rango
            { $set: { imageUrl: "https://res.cloudinary.com/dq7dwhqhh/image/upload/f_auto,q_auto/v1755061135/bulones_by0zgv.png" } } // nuevo valor
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