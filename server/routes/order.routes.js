import express from "express";
import { getOrders, createNewOrder, deleteOrder } from "../controllers/order.controller.js"

const router = express.Router();

router.get("/", getOrders)
router.post("/", createNewOrder)
router.delete("/:orderId", deleteOrder)

export default router;