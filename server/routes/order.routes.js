import express from "express";
import { validateObjectIdParam } from "../utils/validation.js";
import { authenticateJWT, requireAdmin } from "../utils/jwt.js";
import { getOrders, createNewOrder, deleteOrder } from "../controllers/order.controller.js"

const router = express.Router();
router.param("orderId", validateObjectIdParam);

// getOrders devuelve TODAS las reservas (no filtra por usuario) -> solo admin
router.get("/", authenticateJWT, requireAdmin, getOrders)
router.post("/", authenticateJWT, createNewOrder)
router.delete("/:orderId", authenticateJWT, requireAdmin, deleteOrder)

export default router;