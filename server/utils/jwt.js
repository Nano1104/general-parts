import jwt from "jsonwebtoken";

import { NODE_ENV, JWT_TOKEN_KEY } from "../config/envConfig.js";
import User from "../models/user.model.js";

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, JWT_TOKEN_KEY, {expiresIn: '1h'})

    res.cookie('token', token, {
        httpOnly: true,
        secure: NODE_ENV === 'production', // Asegúrate de que está habilitado para HTTPS
        sameSite: NODE_ENV === 'production' ? "None" : "Lax", // Para permitir el envío de cookies entre sitios
        maxAge: 24 * 60 * 60 * 1000, // 1 día
    });
}

export const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Access not authorized' });

    jwt.verify(token, JWT_TOKEN_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        
        req.user = user;
        next();
    });
};

// Debe usarse siempre después de authenticateJWT (necesita req.user.userId)
export const requireAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId).select("role");
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Acceso restringido a administradores" });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: "Error verificando permisos de administrador", error: err.message });
    }
};