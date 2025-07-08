import Order from "../models/order.model.js"
import User from "../models/user.model.js";

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
        const { userId, prods, totalPrice } = req.body

        const userFound = await User.findById(userId);
        if(!userFound) return res.status(404).json({ message: "User not found in db" });

        const products = prods.map(prod => ({
            product: prod.product._id,   
            quantity: prod.quantity     
        }));

        const newOrder = await Order.create({
            userId,                  
            products,        
            totalOrder: totalPrice        
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