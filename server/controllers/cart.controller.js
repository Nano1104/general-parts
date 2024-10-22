import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export const postProductInCertainCart = async (req, res) => {
    try {
        const { productId, cartId } = req.params
        const { amountToAdd } = req.body
        
        const cartFound = await Cart.findById(cartId)
        const prodFound = await Product.findById(productId)

        if (!cartFound || !prodFound) {
            return res.status(404).json({ message: "Carrito o producto no encontrado" });
        }

        if (prodFound.stock < amountToAdd) {
            return res.status(400).json({ message: "No hay suficiente stock disponible" });
        }

        const prodInCart = cartFound.products.find(prod => prod.product.toString() === prodFound._id.toString())
        if(prodInCart) {   //caso de que ya se haya agregado el prod previamente en el cart
            prodInCart.quantity += amountToAdd
        } else {
            cartFound.products.push({ product: prodFound, quantity: amountToAdd })      //agrega el prod al carrito 
        }
        await cartFound.save();

        await Product.updateOne(        //modifica el stock del producto
            { _id: productId },
            { $inc: { stock: -amountToAdd } }
        );

        res.status(200).json({message: "Success adding product in cart", prodFound});
    } catch (err) {
        res.status(400).json({message: "Error posting product in cart", err});
    }
}

export const deleteProdFromCart = async (req, res) => {
    const { cartId, productId } = req.params
    if(!cartId || !productId) return res.status(400).json({message: "cartId or productId are required", err});

    try {
        const cartFound = await Cart.findById(cartId)
        cartFound.products = cartFound.products.filter(prod => prod.product.toString() !== productId);
        await cartFound.save();
        
        return res.status(200).json({ message: "Product removed from cart", cart: cartFound });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
}