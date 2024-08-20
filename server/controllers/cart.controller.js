import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const postProductInCertainCart = (req, res) => {
    try {
        const { productId, cartId, amountToAdd } = req.body
        console.log("🚀 ~ postProductInCertainCart ~ productId:", productId, cartId, amountToAdd)
        const cartFound = Cart.findById(cartId)
        const prodFound = Product.findById(productId)
        /* cartFound.products.push(prodFound) */
        res.status(400).json({message: "Success adding product in cart", cartFound});
    } catch (err) {
        res.status(400).json({message: "Error posting product in cart", err});
    }
}