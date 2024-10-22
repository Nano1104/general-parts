import express from "express";
import { authenticateJWT } from "../utils/jwt.js";
import { postProductInCertainCart, deleteProdFromCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.post("/:cartId/products/:productId", authenticateJWT, postProductInCertainCart)
router.delete("/:cartId/products/:productId", deleteProdFromCart)

export default router