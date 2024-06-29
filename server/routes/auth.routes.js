import express from "express";
import { authenticateJWT } from "../utils/jwt.js"
import { getAuthUser, login, register, logout } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/authUser", authenticateJWT, getAuthUser)
router.post("/login", login)
router.post("/register", register)
router.post("/logout", logout)

export default router