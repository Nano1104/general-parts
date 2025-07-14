import User from "../models/user.model.js";
import Cart from "../models/cart.model.js"
import Order from "../models/order.model.js";

export const getUserById = async (req, res) => {
    try {
        const userFound = await User.findById(req.params.userId);
        res.status(200).json({ message: "Success getting user by Id", userFound });
    } catch (err) {
        res.status(404).json({ message: "Error getting user", error: err.message });
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await User.find({})
        res.status(200).json({ message: "Success getting users from db", users });
    } catch (err) {
        res.status(404).json({ message: "Error getting users", error: err.message });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params
        const userFound = await User.findById(userId);
        if(!userFound) throw new Error("User not found with given Id");

        const updatedUser = await User.findByIdAndUpdate(userId, { ...req.body }, { new: true });

        res.status(200).json({ message: "Success updating user", updatedUser });
    } catch (err) {
        res.status(404).json({ message: "Error trying to update user", error: err.message });
    }
}

export const emptyCartFromUser = async (req, res) => {
    try {
        const { userId, cartId } = req.params

        const userFound = await User.findById(userId);
        const cartFound = await Cart.findById(cartId);
        if(!userFound || !cartFound) throw new Error("User or cart may not exists")

        cartFound.products = [];
        await cartFound.save();  // Guardar los cambios en el carrito

        res.status(200).json({ message: "Success empty cart from user" });
    } catch (err) {
        res.status(404).json({ message: "Error trying to empty cart from user", error: err.message });
    }
}

export const acceptUser = async (req, res) => {
    try {
        const { userId } = req.params
        const userFound = await User.findById(userId);
        if(!userFound) throw new Error("User not found with given Id");

        userFound.accepted = true;
        await userFound.save();

        res.status(200).json({ message: "Success accepting user", userFound });
    } catch (err) {
        res.status(404).json({ message: "Error accepting user", error: err.message });
    }
}

export const deniedUser = async (req, res) => {
    try {
        const { userId } = req.params
        const userFound = await User.findById(userId);
        console.log("🚀 ~ deniedUser ~ userFound:", userFound)
        if(!userFound) throw new Error("User not found with given Id");

        userFound.accepted = false;
        await userFound.save();

        res.status(200).json({ message: "Success denying user", userFound });
    } catch (error) {
        res.status(404).json({ message: "Error accepting user", error: error.message });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Buscar y eliminar usuario
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // 2. Eliminar carrito si existe
        await Cart.deleteOne({ _id: deletedUser.cart });

        // 3. Eliminar órdenes asociadas al usuario
        await Order.deleteMany({ user: userId });

        res.status(200).json({
            message: "Usuario, carrito y órdenes eliminados con éxito",
            deletedUser,
        });
    } catch (err) {
        res.status(500).json({
            message: "Error al eliminar usuario y datos asociados",
            error: err.message,
        });
    }
};