import { postProductsInDB } from "../utils/post-products-db.js";
import Producto from "../models/product.model.js";

export const getProducts = async (req, res) => {
    try {
        const products = await Producto.find({})
        res.status(200).json({message: "Success getting products from mongo database", products});
    } catch (err) {
        res.status(400).json({message: "Error getting products from mongo database", err});
    }
}

export const postProducts = async (req, res) => {
    try {
        const dataToPost = await postProductsInDB("./utils/encendido.json")
        await Producto.insertMany(dataToPost)
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
        
        /* const updatedProducts = await Producto.updateMany(
            { rubro: { $gte: 210, $lte: 215 } }, 
            { $set: update }
        );  */

        const updatedProducts = await Producto.updateMany(
            {}, // Filtro vacío para seleccionar todos los documentos
            { $set: update } // $set añade o actualiza el campo con el valor proporcionado
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
        res.status(200).json({message: "Success deleting field mongo DB collection"});
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