import { postProductsInDB } from "../utils/post-products-db.js";
import Producto from "../models/product.model.js";

/* /api/products?limit=10&category=Electrodomésticos&subcategory=Heladeras&brand=Samsung&minPrice=1000&maxPrice=5000 */

export const getProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const lastId = req.query.lastId;
        const category = req.query.category;
        const subcategory = req.query.subcategory;
        const brand = req.query.brand;
        const minPrice = parseFloat(req.query.minPrice);
        const maxPrice = parseFloat(req.query.maxPrice);
        const search = req.query.search;

        // Construir objeto de filtro
        const filter = {};
        
        if (category) filter.desc_rubro = category.toUpperCase();   //pasamos a mayus porque asi estan en los documentos de la db
        if (subcategory) filter.desc_subrubro = subcategory.toUpperCase();  //pasamos a mayus porque asi estan en los documentos de la db
        if (brand) filter.desc_marca = brand.toUpperCase();     //pasamos a mayus porque asi estan en los documentos de la db
        
        // Filtro por rango de precios
        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            filter.precioimpre = { $gte: minPrice, $lte: maxPrice };
        } else if (!isNaN(minPrice)) {
            filter.precioimpre = { $gte: minPrice };
        } else if (!isNaN(maxPrice)) {
            filter.precioimpre = { $lte: maxPrice };
        }
        
        // Filtro de búsqueda (búsqueda en nombre y descripción)
        if (search) {
            filter.$or = [
                { codpro: { $regex: search, $options: 'i' } },
                { desc_stock: { $regex: search, $options: 'i' } }
            ];
        }

        // Consulta con paginación
        let query = Producto.find(filter);
        
        if (lastId) {
            query = query.where('_id').gt(lastId); // Cursor-based pagination
        }
        
        const products = await query
            .sort({ _id: 1 }) // Ordenar por ID para la paginación
            .limit(limit);
        
        const total = await Producto.countDocuments(filter);
        const hasMore = products.length === limit;

        res.status(200).json({
            success: true,
            products,
            total,
            hasMore
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error al obtener productos",
            error: err.message,
        });
    }
};

export const postProducts = async (req, res) => {
    try {
        const dataToPost = await postProductsInDB("./utils/json/motor-tornillos.json")
        await Producto.insertMany(dataToPost)

        /* req.body = { field: "rubro", newField: "MOTOR" };
        await changeFieldToProducts(req, res) */
        console.log("Productos insertados correctamente");
        res.status(200).json({message: "Success posting products in mongo database", dataToPost});
    } catch (err) {
        res.status(400).json({message: "Error posting products in mongo database", err});
    }
}

export const addFieldToProducts = async (req, res) => {
    try {
        const { field, value } = req.body
        if (!field || !value) throw new Error("Campos 'field' y 'newField' son requeridos en el cuerpo de la solicitud.");

        const update = {};
        update[field] = value;
        
        const updatedProducts = await Producto.updateMany(
            { rubro: { $gte: 200, $lte: 220 } }, 
            { $set: update }
        ); 

        /* const updatedProducts = await Producto.updateMany(
            {}, // Filtro vacío para seleccionar todos los documentos
            { $set: update } // $set añade o actualiza el campo con el valor proporcionado
        ); */

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