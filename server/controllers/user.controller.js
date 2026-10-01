import mongoose from "mongoose";

import User from "../models/user.model.js";
import Cart from "../models/cart.model.js"
import Order from "../models/order.model.js";
import { trusted } from "mongoose";
import { createHash } from "../utils/bcrypt.js";

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
        if (!userFound) throw new Error("User not found with given Id");

        const updatedUser = await User.findByIdAndUpdate(userId, { ...req.body }, { new: true });

        res.status(200).json({ message: "Success updating user", updatedUser });
    } catch (err) {
        res.status(404).json({ message: "Error trying to update user", error: err.message });
    }
}

export const emptyCartFromUser = async (req, res) => {
    try {
        const { userId, cartId } = req.params
        if (req.user.userId !== userId) {
            return res.status(403).json({ message: "No autorizado para modificar el carrito de otro usuario" });
        }

        const userFound = await User.findById(userId);
        const cartFound = await Cart.findById(cartId);
        if (!userFound || !cartFound) throw new Error("User or cart may not exists")

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
        if (!userFound) throw new Error("User not found with given Id");

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
        if (!userFound) throw new Error("User not found with given Id");

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

export const addClientId = async (req, res) => {
    try {
        const { userId } = req.params;
        const { clientId } = req.body;

        if (!userId || !clientId) {
            return res.status(400).json({ message: "userId y clientId son requeridos" });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "userId inválido" });
        }

        const result = await User.findByIdAndUpdate(
            userId,
            { $set: { client_id: clientId } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({
            message: "ClientId agregado con éxito",
            user: result
        });
    } catch (err) {
        res.status(500).json({
            message: "Error al agregar clientId al usuario",
            error: err.message,
        });
    }
};

// PUT /api/user/reset-password/:userId
export const resetUserPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "userId inválido" });
        }

        if (typeof newPassword !== "string" || newPassword.length < 6) {
            return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres" });
        }

        const result = await User.findByIdAndUpdate(
            userId,
            { $set: { password: createHash(newPassword) } },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.status(200).json({ message: "Contraseña actualizada con éxito" });
    } catch (err) {
        res.status(500).json({
            message: "Error al cambiar la contraseña del usuario",
            error: err.message,
        });
    }
};

// PUT /api/users/change-discount/:uid
export const changeUserDiscount = async (req, res) => {
    const { uid } = req.params;
    const { field, value } = req.body;

    if (!["discount_1", "discount_2", "discount_3"].includes(field)) {
        return res.status(400).json({ error: "Campo inválido" });
    }

    try {
        const updated = await User.findByIdAndUpdate(uid, { [field]: value }, { new: true });
        res.json({ message: "Descuento actualizado", user: updated });
    } catch (error) {
        console.error("Error al actualizar descuento:", error);
        res.status(500).json({ error: "Error del servidor" });
    }
}