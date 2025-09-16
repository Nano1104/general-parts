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
    client_id: {
        type: Number,
        default: 0
    },
    last_connection: {
        type: Date,
        default: Date.now
    },
    location: String, 
    city: { type: String, required: true },
    // Asegúrate de que el CUIT sea un string y tenga un formato válido
    cuit: { type: String, required: true } 
})

// Middleware para eliminar en cascada - en caso de que se elimine un usuario, se eliminarán sus órdenes asociadas y su carrito
// 🟢 Caso 1: cuando borrás con `user.remove()`
userSchema.pre("remove", async function (next) {
    await Cart.deleteOne({ user: this._id });
    await Order.deleteMany({ user: this._id });
    next();
});

// 🟢 Caso 2: cuando borrás con `User.findByIdAndDelete()` o `User.deleteOne()`
userSchema.pre("findOneAndDelete", async function (next) {
    const userId = this.getQuery()["_id"];
    await Cart.deleteOne({ user: userId });
    await Order.deleteMany({ user: userId });
    next();
});


const User = mongoose.model("User", userSchema);
export default User;