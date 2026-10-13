import mongoose from "mongoose";

// Cada línea guarda una copia de lo reservado (código, descripción, precio de lista y cantidad):
// la reserva no cambia si después el producto cambia de precio o se borra.
// Las reservas anteriores a este cambio solo tienen { product, quantity }.
const orderLineSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    codpro: String,
    desc_stock: String,
    unitPrice: Number,  // precio de lista al momento de reservar
    quantity: Number
}, { _id: false })

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    // Copia de los datos del cliente: la reserva sigue identificable aunque se borre el usuario
    customer: {
        first_name: String,
        last_name: String,
        email: String,
        phone: Number,
        cuit: String,
        city: String
    },
    products: {
        type: [orderLineSchema]
    },
    discounts: {
        discount_1: Number,
        discount_2: Number,
        discount_3: Number
    },
    subtotal: Number,       // suma a precio de lista
    totalOrder: {           // total con los descuentos del cliente aplicados
        type: Number,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const Order = mongoose.model("Order", orderSchema);
export default Order;
