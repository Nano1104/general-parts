import express from "express";
import { validateObjectIdParam } from "../utils/validation.js";
import { authenticateJWT, resolvePriceAccess } from "../utils/jwt.js";
import { getCart, postProductInCertainCart, deleteProdFromCart } from "../controllers/cart.controller.js";

const router = express.Router();
router.param("cartId", validateObjectIdParam);
router.param("productId", validateObjectIdParam);

router.get("/:cartId", authenticateJWT, resolvePriceAccess, getCart)
router.post("/:cartId/products/:productId", authenticateJWT, resolvePriceAccess, postProductInCertainCart)
router.delete("/:cartId/products/:productId", authenticateJWT, resolvePriceAccess, deleteProdFromCart)

export default router