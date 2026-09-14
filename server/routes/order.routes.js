import express from "express";
import { authenticateJWT, requireAdmin } from "../utils/jwt.js";
import { getOrders, createNewOrder, deleteOrder } from "../controllers/order.controller.js"

const router = express.Router();

// getOrders devuelve TODAS las reservas (no filtra por usuario) -> solo admin
router.get("/", authenticateJWT, requireAdmin, getOrders)
router.post("/", authenticateJWT, createNewOrder)
router.delete("/:orderId", authenticateJWT, requireAdmin, deleteOrder)

export default router;