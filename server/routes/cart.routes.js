import express from "express";
import { postProductInCertainCart, deleteProdFromCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/:cartId/products/:productId", postProductInCertainCart)
router.delete("/:cartId/products/:productId", deleteProdFromCart)

export default router