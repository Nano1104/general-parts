import express from 'express';
import { getUserById, getUsers, updateUser, emptyCartFromUser, deleteUser } from '../controllers/user.controller.js';

const router = express.Router();

router.get("/", getUsers)
router.get("/:userId", getUserById)
router.put("/:userId", updateUser)
router.put("/:userId/cart/:cartId", emptyCartFromUser)
router.delete("/:userId", deleteUser)

export default router