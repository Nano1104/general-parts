import mongoose from "mongoose";

import User from "../models/user.model.js";
import Cart from "../models/cart.model.js"
import { createHash } from "../utils/bcrypt.js";


export const getUsers = async (req, res) => {
    try {
        const users = await User.find({})
        res.status(200).json({ message: "Success getting users from db", users });
    } catch (err) {
        res.status(404).json({ message: "Error getting users", error: err.message });
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

        // 2. Eliminar su carrito. Las reservas se conservan como historial (tienen copia del cliente)
        await Cart.deleteMany({ $or: [{ _id: deletedUser.cart }, { userId: deletedUser._id }] });

        res.status(200).json({
            message: "Usuario y carrito eliminados; sus reservas se conservan",
            deletedUser,
        });
    } catch (err) {
        res.status(500).json({
            message: "Error al eliminar usuario y datos asociados",
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
            { $set: { password: await createHash(newPassword) } },
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