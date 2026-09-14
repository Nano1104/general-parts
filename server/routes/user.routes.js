import express from 'express';
import { authenticateJWT, requireAdmin } from "../utils/jwt.js";
import {
    getUserById, getUsers, updateUser, emptyCartFromUser, acceptUser,
    deniedUser, deleteUser, addClientId, changeUserDiscount
} from '../controllers/user.controller.js';

const router = express.Router();
// Rutas con prefijos específicos primero
router.get("/", authenticateJWT, requireAdmin, getUsers);
router.put("/accept/:userId", authenticateJWT, requireAdmin, acceptUser);
router.put("/denied/:userId", authenticateJWT, requireAdmin, deniedUser);
router.put("/:userId/cart/:cartId", authenticateJWT, emptyCartFromUser); // ownership check en el controller
router.put("/add-clientId/:userId", authenticateJWT, requireAdmin, addClientId)
router.put("/change-discount/:uid", authenticateJWT, requireAdmin, changeUserDiscount);

// Rutas genéricas después
router.get("/:userId", authenticateJWT, requireAdmin, getUserById);
router.put("/:userId", authenticateJWT, requireAdmin, updateUser);
router.delete("/:userId", authenticateJWT, requireAdmin, deleteUser);

export default router