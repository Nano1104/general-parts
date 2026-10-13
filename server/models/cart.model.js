import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    products: {
        type: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product"
                },
                quantity: Number
            }
        ]
    }
}, { timestamps: true }) // updatedAt marca la última modificación: el carrito se vacía tras 1 día sin cambios (jobs/maintenance.js)

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;