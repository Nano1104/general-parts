import Order from "../models/order.model.js"
import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { userDiscounts, netFactor, roundMoney } from "../utils/discounts.js";

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({})
            .sort({ _id: -1 })   // más nuevas primero
            .populate("userId", "first_name last_name email phone role cuit city")
            // Solo lo usan las reservas viejas, que no tienen copia de las líneas
            .populate("products.product", "codpro desc_stock precioimpre")

        res.status(200).json({ message: "Success getting orders", orders });
    } catch (err) {
        res.status(500).json({ message: "Error getting orders", err });
    }
}

// Confirma la reserva a partir del carrito guardado en la DB (el body se ignora).
// Vaciar el carrito y leer su contenido es una sola operación atómica: un doble clic o un
// reintento encuentra el carrito ya vacío y no genera una reserva duplicada.
export const createNewOrder = async (req, res) => {
    try {
        const userId = req.user.userId; // el dueño de la orden es siempre el usuario autenticado

        const user = await User.findById(userId).lean();
        if (!user) return res.status(404).json({ message: "User not found in db" });

        const cart = await Cart.findOneAndUpdate(
            { _id: user.cart, userId: user._id, "products.0": { $exists: true } },
            { $set: { products: [] } },
            { new: false }
        ).lean();
        if (!cart) return res.status(400).json({ message: "El carrito está vacío" });

        const restoreCart = () => Cart.updateOne({ _id: cart._id }, { $set: { products: cart.products } });

        try {
            const dbProducts = await Product.find({ _id: { $in: cart.products.map(i => i.product) } })
                .select("codpro desc_stock precioimpre").lean();
            const productById = new Map(dbProducts.map(p => [p._id.toString(), p]));

            // Ítems de productos que ya no existen se descartan (y no vuelven al carrito)
            const lines = cart.products
                .filter(item => productById.has(item.product?.toString()))
                .map(item => {
                    const p = productById.get(item.product.toString());
                    return { product: p._id, codpro: p.codpro, desc_stock: p.desc_stock, unitPrice: p.precioimpre, quantity: item.quantity };
                });
            if (lines.length === 0) {
                return res.status(400).json({ message: "Los productos del carrito ya no están disponibles" });
            }

            const subtotal = roundMoney(lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0));
            const newOrder = await Order.create({
                userId: user._id,
                customer: {
                    first_name: user.first_name, last_name: user.last_name, email: user.email,
                    phone: user.phone, cuit: user.cuit, city: user.city
                },
                products: lines,
                discounts: userDiscounts(user),
                subtotal,
                totalOrder: roundMoney(subtotal * netFactor(user)),
            });

            // Sin precios en la respuesta: el cliente puede no estar dado de alta
            res.status(200).json({ message: "Success creating order", newOrder: { _id: newOrder._id, createdAt: newOrder.createdAt } });
        } catch (err) {
            await restoreCart(); // si falla la creación, el carrito vuelve a como estaba
            throw err;
        }
    } catch (err) {
        console.error("Error creating order:", err);
        res.status(500).json({ message: "Error creating new order" });
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
