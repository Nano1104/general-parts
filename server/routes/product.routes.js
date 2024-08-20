import express from "express";
import { getProducts, postProducts, addFieldToProducts, changeFieldToProducts, deleteFieldFromProducts, deleteMongoDBCollection } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts)
router.get('/post-products-in-db', postProducts)
router.put("/add-field-to-products", addFieldToProducts)
router.put("/change-field-to-products", changeFieldToProducts)
router.put("/delete-products-field", deleteFieldFromProducts)
router.delete("/delete-mongo-db", deleteMongoDBCollection)


export default router;