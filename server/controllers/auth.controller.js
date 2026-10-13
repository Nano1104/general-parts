import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";
import { createHash } from "../utils/bcrypt.js";
import { isValidPassword } from "../utils/bcrypt.js";
import { generateTokenAndSetCookie } from "../utils/jwt.js";
import { NODE_ENV } from "../config/envConfig.js";
import { normalizeEmail, CASE_INSENSITIVE } from "../utils/validation.js";
import { userCanSeePrices, stripCartPrices } from "../utils/priceVisibility.js";

// Hash contra el que se compara cuando el email no existe, para que la respuesta tarde lo mismo
const DUMMY_HASH = createHash("dummy-password-for-timing");

// El carrito viene populado con productos: sin alta, no se envían sus precios
const withVisibleCartPrices = (userDoc) => {
    const user = userDoc.toObject();
    delete user.password; // login lo trae con +password para validar; no se devuelve
    // Ítems de productos borrados (populate -> null) no se envían; getCart los limpia de la DB
    if (user.cart?.products) user.cart.products = user.cart.products.filter(item => item.product);
    if (!userCanSeePrices(user) && user.cart) user.cart = stripCartPrices(user.cart);
    return user;
}

export const getAuthUser = async (req, res) => {
    try {
        if (!req.user) return res.status(404).json({ message: "No authenticated user found" });

        const user = await User.findById(req.user.userId)
            .populate({
                path: 'cart',
                populate: {
                    path: 'products.product',
                    model: 'Product'    // Asegúrate de que este es el nombre correcto de tu modelo de producto
                }
            })
            .exec();
        // Token válido pero usuario borrado: se trata como no autenticado
        if (!user) return res.status(401).json({ message: "No authenticated user found" });

        res.json(withVisibleCartPrices(user));
    } catch (err) {
        res.status(500).json({ message: "Error getting auth user", error: err.message });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: "Some fields may be empty" });
        // Solo strings: un objeto ({ $regex: ... }) en email permitía usar el login como oráculo de emails
        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Formato de datos inválido" });
        }

        const user = await User.findOne({ email: normalizeEmail(email) }).collation(CASE_INSENSITIVE).select("+password").populate({
            path: 'cart',
            populate: {
                path: 'products.product',
                model: 'Product'    // Asegúrate de que este es el nombre correcto de tu modelo de producto
            }
        }).exec();

        // Mismo mensaje (y mismo costo de bcrypt) en ambos casos: no revelar qué emails están registrados
        const passwordOk = await isValidPassword(password, user ?? { password: await DUMMY_HASH });
        if (!user || !passwordOk) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        generateTokenAndSetCookie(user._id, res)

        res.status(200).json({ message: "Login Successfull", user: withVisibleCartPrices(user) });
    } catch (err) {
        res.status(500).json({ message: "Error trying to login", error: err.message });
    }
}

export const register = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, password, city, cuit, location } = req.body

        if (!first_name || !last_name || !email || !phone || !password || !city || !cuit) {
            return res.status(400).json({
                message: "Faltan campos requeridos en el registro"
            });
        }

        // Solo strings: evita que un objeto ({ $ne: null }) llegue como operador a las queries de Mongo
        const textFields = { first_name, last_name, email, password, city, cuit };
        if (Object.values(textFields).some(v => typeof v !== "string") ||
            !["string", "number"].includes(typeof phone) ||
            (location !== undefined && typeof location !== "string")) {
            return res.status(400).json({ message: "Formato de datos inválido" });
        }

        // Mismo mínimo que el formulario; 72 es el máximo que bcrypt realmente usa
        if (password.length < 8 || password.length > 72) {
            return res.status(400).json({ message: "La contraseña debe tener entre 8 y 72 caracteres" });
        }

        // Whitelist explícita: role, accepted, descuentos, client_id, cart, etc. nunca vienen del cliente
        const userToCreate = {
            first_name,
            last_name,
            email: normalizeEmail(email),
            phone,
            city,
            cuit,
            ...(location && { location }),
            password: await createHash(password),
            role: "user",
            discount_1: 0,
            discount_2: 0,
            discount_3: 0
        }

        const userFound = await User.findOne({ email: normalizeEmail(email) }).collation(CASE_INSENSITIVE);
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