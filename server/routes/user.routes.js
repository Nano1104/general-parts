import express from 'express';
import {
    getUserById, getUsers, updateUser, emptyCartFromUser, acceptUser,
    deniedUser, deleteUser, addClientId
} from '../controllers/user.controller.js';

const router = express.Router();
// Rutas con prefijos específicos primero
router.get("/", getUsers);
router.put("/accept/:userId", acceptUser);
router.put("/denied/:userId", deniedUser);
router.put("/:userId/cart/:cartId", emptyCartFromUser);
router.put("/add-clientId/:userId", addClientId)

// Rutas genéricas después
router.get("/:userId", getUserById);
router.put("/:userId", updateUser);
router.delete("/:userId", deleteUser);

export default router