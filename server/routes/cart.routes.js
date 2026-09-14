import express from "express";
import { authenticateJWT } from "../utils/jwt.js";
import { getCart, postProductInCertainCart, deleteProdFromCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/:cartId", authenticateJWT, getCart)
router.post("/:cartId/products/:productId", authenticateJWT, postProductInCertainCart)
router.delete("/:cartId/products/:productId", authenticateJWT, deleteProdFromCart)

export default router