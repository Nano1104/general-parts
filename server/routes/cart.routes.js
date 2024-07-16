import express from "express";
import { postProductInCertainCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/:cartId/products/:productId", postProductInCertainCart)

export default router