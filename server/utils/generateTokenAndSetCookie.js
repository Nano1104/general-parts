import jwt from "jsonwebtoken";

import { JWT_TOKEN_KEY } from "../config/envConfig.JS";

const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, JWT_TOKEN_KEY, {expiresIn: '1h'})

    res.cookie('token', token, {
        httpOnly: true,
        secure: true, // Asegúrate de que está habilitado para HTTPS
        sameSite: 'None', // Para permitir el envío de cookies entre sitios
        maxAge: 24 * 60 * 60 * 1000, // 1 día
    });
}

export default generateTokenAndSetCookie