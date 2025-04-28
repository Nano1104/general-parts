import { postProductsInDB } from "../utils/post-products-db.js";
import Producto from "../models/product.model.js";
import cache from "memory-cache";
import { getSubcategory } from "../utils/getSubcategories.js"
import xlsx from 'xlsx';
import _ from "lodash";


export const getAllProducts = async (req, res) => {
    const { rubro } = req.params

    if (!rubro) {
        return res.status(400).json({ message: "El parámetro 'desc_rubro' es requerido" });
    }

    try {
        const products = await Producto.find({ desc_rubro: rubro })
        res.status(200).json({message: "Success getting all products from db", productsQuantity: products.length});
    } catch (err) {
        res.status(400).json({message: "Error getting all products from db", err});
    }
}

export const getProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const lastId = req.query.lastId;
        const category = req.query.category;
        const subcategory = req.query.subcategory;
        const categories = req.query.categories;
        const brand = req.query.brand;
        const minPrice = parseFloat(req.query.minPrice);
        const maxPrice = parseFloat(req.query.maxPrice);
        const search = req.query.search;

        // 1. Crear una clave única para el cache basada en todos los parámetros
        const cacheKey = JSON.stringify({
            limit,
            lastId,
            category,
            subcategory,
            categories,
            brand,
            minPrice,
            maxPrice,
            search
        });

        // 2. Verificar si existe respuesta en cache
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            /* console.log('📦 Sirviendo desde cache', cacheKey); */
            return res.status(200).json(cachedData);
        }

        // 3. Construir filtro (tu lógica original)
        const filter = {};
        if (category) filter.desc_rubro = category.toUpperCase();
        if (subcategory) {
            if (subcategory == "bulones" || subcategory == "engranaje") {
                const arrayIdsSubcategory = getSubcategory(category, subcategory)
                console.log("🚀 ~ getProducts ~ arrayIdsSubcategory:", arrayIdsSubcategory)

                if (arrayIdsSubcategory?.length === 2) {
                    filter.subrub = {
                        $gte: arrayIdsSubcategory[0],
                        $lte: arrayIdsSubcategory[1]
                    };
                }
            } else {
                filter.desc_subrub = subcategory.toUpperCase();
            }
        }
        if (categories) filter.desc_subrub = categories.toUpperCase();
        if (brand) filter.desc_marca = brand.toUpperCase();
        
        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            filter.precioimpre = { $gte: minPrice, $lte: maxPrice };
        } else if (!isNaN(minPrice)) {
            filter.precioimpre = { $gte: minPrice };
        } else if (!isNaN(maxPrice)) {
            filter.precioimpre = { $lte: maxPrice };
        }
        
        if (search) {
            const decodedSearch = decodeURIComponent(search);
            filter.$or = [
                { codpro: { $regex: decodedSearch, $options: 'i' } },
                { desc_stock: { $regex: decodedSearch, $options: 'i' } }
            ];
        }

        // 4. Consulta a MongoDB
        let query = Producto.find(filter);
        if (lastId) {
            query = query.where('_id').gt(lastId);
        }
        
        const products = await query.sort({ _id: 1 }).limit(limit);
        const total = await Producto.countDocuments(filter);
        const hasMore = products.length === limit;

        // 5. Preparar respuesta y guardar en cache
        const response = {
            success: true,
            products,
            total,
            hasMore
        };

        // Cachear por 5 minutos (300000 ms) - Ajusta según tus necesidades
        cache.put(cacheKey, response, 300000);

        res.status(200).json(response);

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error al obtener productos",
            error: err.message,
        });
    }
}

export const getProductById = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Producto.findOne({ codpro: id });

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

export const uploadExcelProducts = async (req, res) => {
    try {
        // 1. Validar archivo
        if (!req.file) {
            return res.status(400).json({ message: "No se subió ningún archivo" });
        }

        // 2. Leer archivo Excel
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const excelItems = xlsx.utils.sheet_to_json(worksheet);

        // 3. Configuración de campos
        const REQUIRED_FIELDS = [
            'codpro', 'desc_stock', 'rubro', 
            'subrub', 'proveed', 'desc_subrub',
            'desc_marca', 'porcen1', 'precioimpre'
        ];

        // 4. Procesamiento de items - versión corregida
        let productsToUpsert = [];
        let invalidProducts = [];
        
        for (let i = 0; i < excelItems.length; i++) {
            const item = excelItems[i];
            const rowNumber = i + 2;
            
            // Validación de codpro
            const codpro = item.codpro?.toString().trim();
            if (!codpro) {
                invalidProducts.push(`Fila ${rowNumber}: codpro es requerido`);
                continue;
            }

            // Buscar si el producto ya existe en la DB
            const existingProduct = await Producto.findOne({ codpro });

            // Función mejorada para parseo seguro
            const safeParseNumber = (value, isInt = true) => {
                if (value === undefined || value === null || value === "") return undefined;
                const num = isInt ? parseInt(value) : parseFloat(value);
                return isNaN(num) ? undefined : num;
            };

            // Mapeo de campos con validación mejorada
            const mappedItem = {
                codpro,
                ...(item.desc_stock !== undefined && { 
                    desc_stock: item.desc_stock?.toString().trim() || null 
                }),
                rubro: safeParseNumber(item.rubro),
                subrub: safeParseNumber(item.subrub),
                proveed: safeParseNumber(item.proveed),
                desc_rubro: req.body.rubro,
                ...(item.desc_rubro !== undefined && { 
                    desc_subrub: item.desc_rubro?.toString().trim() || null 
                }),
                ...(item.desc_marca !== undefined && { 
                    desc_marca: item.desc_marca?.toString().trim() || null 
                }),
                porcen1: safeParseNumber(item.porcen1),
                precioimpre: safeParseNumber(item.precioimpre),
                stock: existingProduct ? existingProduct.stock : 0,
                lastUpdated: new Date()
            };

            // Verificar campos requeridos
            const missingFields = REQUIRED_FIELDS.filter(field => 
                mappedItem[field] === undefined || mappedItem[field] === null || mappedItem[field] === ''
            );

            if (missingFields.length > 0) {
                invalidProducts.push(
                    `Fila ${rowNumber}: Faltan campos requeridos (${missingFields.join(', ')})`
                );
                continue;
            }

            productsToUpsert.push(mappedItem);
        }

        // 5. Preparar operaciones de upsert (actualizar o insertar)
        const bulkOps = productsToUpsert.map(item => ({
            updateOne: {
                filter: { codpro: item.codpro },
                update: {
                    $set: _.omit(item, ['codpro']),
                    $setOnInsert: { createdAt: new Date() }
                },
                upsert: true
            }
        }));

        // 6. Ejecutar operaciones
        const result = await Producto.bulkWrite(bulkOps);

        // 7. Obtener estadísticas reales
        const existingCount = productsToUpsert.length - result.upsertedCount;
        
        res.json({
            message: 'Proceso completado',
            details: {
                totalProcesados: excelItems.length,
                nuevosInsertados: result.upsertedCount,
                existentesActualizados: existingCount - result.modifiedCount,
                actualizadosConCambios: result.modifiedCount,
                productosInvalidos: invalidProducts.length,
                errores: invalidProducts
            }
        });

    } catch (err) {
        console.error("Error en upload-excel:", err);
        res.status(500).json({ 
            message: "Error procesando el archivo",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
}

export const postProducts = async (req, res) => {
    try {
        const dataToPost = await postProductsInDB("./utils/json/inyeccion-sondas.json");
        const result = await Producto.insertMany(dataToPost);
        
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
        if (!field || !value) throw new Error("Campos 'field' y 'newField' son requeridos en el cuerpo de la solicitud.");

        const update = {};
        update[field] = value;
        
        //agrega el campo solo a los prods que cumplan con la condicion
        /* const updatedProducts = await Producto.updateMany(
            { rubro: { $gte: 361, $lte: 361 } }, 
            { $set: update }
        );  */

        //agrega el campo a todos los prods de la collection
        const updatedProducts = await Producto.updateMany(
            {},  // Selecciona TODOS los productos
            { $set: update }  // Añade/modifica el campo
          );
       
        if (updatedProducts.acknowledged && updatedProducts.modifiedCount > 0) {
            res.status(200).json({message: "Success adding field to all products in DB", updatedProducts});
        } else {
            res.status(200).json({message: "No products were updated", updatedProducts});
        }
    } catch (err) {
        res.status(400).json({message: "Error adding field to products in DB", err});
    }
}

export const changeProductFieldVal = async (req, res) => {
    try {
        const { prodId } = req.params
        const { field, value } = req.body
        if(!field || !value) throw new Error("Field does not exists")  

        const prodFound = await Producto.findById(prodId);      //busca si existe el producto en la db
        if (!prodFound) return res.status(404).json({ message: "Product not found in db" });

        const fieldExists = await Producto.findOne({ _id: prodId, [field]: { $exists: true } });    //busca si existe el campo del producto en la db
        if (!fieldExists) return res.status(400).json({ message: `Field '${field}' does not exist in the document` });

        const updateData = { [field]: value };

        const updatedProduct = await Producto.findByIdAndUpdate(
            prodId,
            updateData,
            { new: true }
        );

        if (!updatedProduct) return res.status(500).json({ message: "Error renaming field in DB" });

        res.status(200).json({message: "Success changing product field", updatedProduct});
    } catch (err) {
        res.status(400).json({message: "Error changing field to product in DB", err});
    }
}

export const changeFieldValueToProducts = async (req, res) => {
    try {
        const { field, value } = req.body
        if(!field || !value) throw new Error("Field does not exists")  

        const missingFieldCount = await Producto.countDocuments({ [field]: { $exists: false } });
        if (missingFieldCount > 0) throw new Error(`The field "${field}" is missing in ${missingFieldCount} documents`);
        
        const updateObject = { [field]: value };

        const updatedProducts = await Producto.updateMany({}, { $set: updateObject });

        res.status(200).json({message: "Success changing field name and its value", updatedProducts});
    } catch (err) {
        res.status(400).json({message: "Error changing field name and its value", err});
    }
}

export const changeFieldToProducts = async (req, res) => {
    try {
        const { field, newField } = req.body
        if(!field) throw new Error("Field does not exists")

        const renameObject = {};
        renameObject[field] = newField;

        const updatedProducts = await Producto.updateMany({}, { $rename: renameObject });

        res.status(200).json({message: "Success changing field to products in DB", updatedProducts});
    } catch (err) {
        res.status(400).json({message: "Error changing field to products in DB", err});
    }
}

export const deleteMongoDBCollection = async (req, res) => {
    try {
        await Producto.deleteMany({})
        res.status(200).json({message: "Success deleting mongo DB collection"});
    } catch (err) {
        res.status(400).json({message: "Error deleting mongo DB collection", err});
    }
}

export const updateStock = async (req, res) => {
    try {
        const { productId } = req.params
        const { newStock } = req.body

        const prodFound = await Producto.findById(productId);
        if (!prodFound) return res.status(404).json({ message: "Product not found in db" });

        const updatedProduct = await Producto.findByIdAndUpdate(
            productId,
            { stock: prodFound.stock + Number(newStock) },
            { new: true } // Esto devuelve el documento actualizado
        );

        res.status(200).json({message: "Success updating stock from product", updatedProduct });
    } catch (err) {
        res.status(400).json({message: "Error deleting mongo DB collection", err});
    }
}

export const deleteFieldFromProducts = async (req, res) => {
    try {
        const { field } = req.body
        if(!field) throw new Error("Field does not exists")

        const update = {};
        update[field] = ""; 

        const updatedProducts = await Producto.updateMany({}, { $unset: update })

        res.status(200).json({message: "Success deleting field from products"});
    } catch (err) {
        res.status(400).json({message: "Error deleting field from products", err});
    }
}