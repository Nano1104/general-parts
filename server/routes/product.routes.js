import express from "express";
import { getProducts, postProducts } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts)
router.get('/post-products-in-db', postProducts)

export default router;