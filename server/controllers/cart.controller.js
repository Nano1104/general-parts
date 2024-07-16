import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const postProductInCertainCart = (req, res) => {
    try {
        const { productId, cartId } = req.params
        
        const cartFound = Cart.findById(cartId)
        const prodFound = Product.findById(productId)
    } catch (err) {
        res.status(400).json({message: "Error posting product in database", err});
    }
}