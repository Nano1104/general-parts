import mongoose from "mongoose";
import Order from "../models/order.model.js"
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { isValidQuantity } from "../utils/quantity.js";

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
                                    .populate("userId")
                                    .populate("products.product")

        res.status(200).json({ message: "Success getting orders", orders });
    } catch (err) {
        res.status(500).json({ message: "Error getting orders", err });
    }
}

export const createNewOrder = async (req, res) => {
    try {
        const { prods } = req.body
        const userId = req.user.userId; // el dueño de la orden es siempre el usuario autenticado

        const userFound = await User.findById(userId);
        if(!userFound) return res.status(404).json({ message: "User not found in db" });

        if (!Array.isArray(prods) || prods.length === 0) {
            return res.status(400).json({ message: "La reserva no tiene productos" });
        }

        const products = prods.map(prod => ({
            product: prod?.product?._id,
            quantity: prod?.quantity
        }));
        if (products.some(p => !mongoose.Types.ObjectId.isValid(p.product) || !isValidQuantity(p.quantity))) {
            return res.status(400).json({ message: "Productos o cantidades inválidas" });
        }

        // Total calculado en el servidor con precios de la DB (precio de lista × cantidad);
        // el totalPrice que manda el cliente se ignora.
        const dbProducts = await Product.find({ _id: { $in: products.map(p => p.product) } })
            .select("precioimpre").lean();
        const priceById = new Map(dbProducts.map(p => [p._id.toString(), p.precioimpre]));
        if (priceById.size !== new Set(products.map(p => p.product.toString())).size) {
            return res.status(404).json({ message: "Algún producto de la reserva ya no existe" });
        }
        const totalOrder = products.reduce((sum, p) => sum + priceById.get(p.product.toString()) * p.quantity, 0);

        const newOrder = await Order.create({
            userId,
            products,
            totalOrder
        });

        res.status(200).json({ message: "Success creating order", newOrder });
    } catch (err) {
        res.status(500).json({ message: "Error creating new order", err });
    }
}

export const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params

        const orderFound = await Order.findByIdAndDelete(orderId)
        if(!orderFound) return res.status(404).json({ message: "Order not found in db" });

        res.status(200).json({ message: "Success deleting order", orderFound });
    } catch (err) {
        res.status(500).json({ message: "Error deleting order", err });
    }
}