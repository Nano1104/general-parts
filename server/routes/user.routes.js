import express from 'express';
import { validateObjectIdParam } from "../utils/validation.js";
import { authenticateJWT, requireAdmin } from "../utils/jwt.js";
import {
    getUsers, emptyCartFromUser, acceptUser,
    deniedUser, deleteUser, changeUserDiscount, resetUserPassword
} from '../controllers/user.controller.js';

const router = express.Router();
router.param("userId", validateObjectIdParam);
router.param("cartId", validateObjectIdParam);
router.param("uid", validateObjectIdParam);
// Rutas con prefijos específicos primero
router.get("/", authenticateJWT, requireAdmin, getUsers);
router.put("/accept/:userId", authenticateJWT, requireAdmin, acceptUser);
router.put("/denied/:userId", authenticateJWT, requireAdmin, deniedUser);
router.put("/:userId/cart/:cartId", authenticateJWT, emptyCartFromUser); // ownership check en el controller
router.put("/change-discount/:uid", authenticateJWT, requireAdmin, changeUserDiscount);
router.put("/reset-password/:userId", authenticateJWT, requireAdmin, resetUserPassword);

// Rutas genéricas después
router.delete("/:userId", authenticateJWT, requireAdmin, deleteUser);

export default router