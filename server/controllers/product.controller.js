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
        res.status(200).json({message: "Success posting products in mongo database"});
    } catch (err) {
        res.status(400).json({message: "Error posting products in mongo database", err});
    }
}