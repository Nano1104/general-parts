import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";
import { createHash } from "../utils/bcrypt.js";
import { isValidPassword } from "../utils/bcrypt.js";
import { generateTokenAndSetCookie } from "../utils/jwt.js";
import { NODE_ENV } from "../config/envConfig.js";

export const getAuthUser = async (req, res) => {
    try {
        if (!req.user) return res.status(404).json({ message: "No authenticated user found" });

        const user = await User.findById(req.user.userId)
            .select("-password")   // ← excluye el campo password
            .populate({
                path: 'cart',
                populate: {
                    path: 'products.product',
                    model: 'Product'    // Asegúrate de que este es el nombre correcto de tu modelo de producto
                }
            })
            .exec();

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error getting auth user", error: err.message });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Some fields may be empty" });

        const user = await User.findOne({ email: email }).populate({
            path: 'cart',
            populate: {
                path: 'products.product',
                model: 'Product'    // Asegúrate de que este es el nombre correcto de tu modelo de producto
            }
        }).exec();

        if (!user) return res.status(404).json({ message: "User does not exist" })   //si no se encuentra el user

        if (!isValidPassword(password, user)) return res.status(401).json({ message: "password incorrect" })        //o si la contraseña es incorrecta 

        generateTokenAndSetCookie(user._id, res)

        res.status(200).json({ message: "Login Successfull", user: user });
    } catch (err) {
        res.status(500).json({ message: "Error trying to login", error: err.message });
    }
}

export const register = async (req, res) => {
    try {
        const { first_name, email, phone, password, role, city, cuit } = req.body

        if (!first_name || !email || !phone || !password || !city || !cuit) {
            return res.status(400).json({
                message: "Faltan campos requeridos en el registro"
            });
        }

        const userToCreate = {
            ...req.body,
            password: createHash(password),
            role: "user",              // ← hardcodeado, siempre
            discount_1: 0,
            discount_2: 0,
            discount_3: 0
        }

        if (email == "swrepuestos@yahoo.com.ar") userToCreate.role = "admin"

        const userFound = await User.findOne({ email: email });
        if (userFound) return res.status(409).json({ message: "user already exists" })

        const user = await User.create({ ...userToCreate })     //user create 

        const cart = await Cart.create({ userId: user._id })    //cart create

        user.cart = cart._id;
        await user.save();

        res.status(200).json({ message: "Register Successfull" });
    } catch (err) {
        // Mongoose duplicate key error
        if (err.code === 11000) {
            const duplicatedField = Object.keys(err.keyValue)[0];

            const fieldMessages = {
                email: "Este email ya está registrado",
                phone: "Este número de teléfono ya está registrado",
                cuit: "Este CUIT ya está registrado",
            };

            return res.status(409).json({
                message: fieldMessages[duplicatedField] ?? "Un campo único ya está en uso"
            });
        }

        // Error genérico real
        console.error("Register error:", err);
        res.status(500).json({ message: "Error interno del servidor" });
    }
}


////// LOGOUT CONTROLLER
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: NODE_ENV === 'production',
            sameSite: NODE_ENV === 'production' ? 'None' : 'Lax',
        });

        res.status(200).json({ message: "Success Logout" });
    } catch (err) {
        res.status(500).json({ message: "Error trying to logout", error: err.message });
    }
}