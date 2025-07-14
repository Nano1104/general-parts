import mongoose from "mongoose";
import Order from "./order.model.js";
import Cart from "./cart.model.js";

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    }, 
    last_name: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin", "premium"],
        required: true
    },
    accepted: {
        type: Boolean,
        default: false
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart"
    },
    last_connection: {
        type: Date,
        default: Date.now
    },
    location: { type: String, required: true },
    city: { type: String, required: true },
    // Asegúrate de que el CUIT sea un string y tenga un formato válido
    cuit: { type: String, required: true } 
})

// Middleware para eliminar en cascada - en caso de que se elimine un usuario, se eliminarán sus órdenes asociadas y su carrito
userSchema.pre('remove', async function (next) {
    await Cart.deleteOne({ user: this._id });
    await Order.deleteMany({ user: this._id });
    next();
});


const User = mongoose.model("User", userSchema);
export default User;