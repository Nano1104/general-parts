import express from "express";
import { getProducts, postProducts, addFieldToProducts, changeFieldToProducts, deleteMongoDBCollection } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts)
router.get('/post-products-in-db', postProducts)
router.put("/add-field-to-products", addFieldToProducts)
router.put("/change-field-to-products", changeFieldToProducts)
router.delete("/delete-mongo-db", deleteMongoDBCollection)


export default router;