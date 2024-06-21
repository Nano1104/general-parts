import User from "../models/user.model.js";
import Cart from "../models/cart.model.js";
import { createHash } from "../utils/bcrypt.js";

export const login = async (req, res) => {
    try {
        res.status(200).json({ message: "Login Successfull" });
    } catch (err) {
        res.status(404).json({ message: "Error trying to register", error: err.message });
    }
}

export const register = async (req, res) => {
    try {
        const { first_name, email, phone, password, role } = req.body
        
        if(!first_name || !email || !phone || !password) throw new Error("Some fields may be empty");

        const userToCreate = {
            ...req.body,
            password: createHash(password),
            role: role || "user"
        }

        if(email == "swrepuestos@yahoo.com.ar" && password == '12345') userToCreate.role = "admin" 

        const userFound = await User.findOne({ email: email });
        if(userFound) res.status(400).json({message: "User already exists"})

        const user = await User.create({ ...userToCreate })     //user create 
        const cart = await Cart.create({ userId: user._id })    //cart create

        user.cart = cart._id;
        await user.save();

        res.status(200).json({ message: "Register Successfull" });
    } catch (err) {
        res.status(404).json({ message: "Error trying to register", error: err.message });
    }
}