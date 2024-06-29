import jwt from "jsonwebtoken";

import { JWT_TOKEN_KEY } from "../config/envConfig.js";

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, JWT_TOKEN_KEY, {expiresIn: '1h'})

    res.cookie('token', token, {
        httpOnly: true,
        secure: false, // Asegúrate de que está habilitado para HTTPS
        sameSite: 'Strict', // Para permitir el envío de cookies entre sitios
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