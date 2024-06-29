import User from "../models/user.model.js";

export const getUserById = async (req, res) => {
    try {
        const userFound = await User.findById(req.params.userId);
        res.status(200).json({ message: "Success getting user by Id", userFound });
    } catch (err) {
        res.status(404).json({ message: "Error getting user", error: err.message });
    }
}