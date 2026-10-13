import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { isValidQuantity, MAX_QUANTITY } from "../utils/quantity.js";

export const getCart = async (req, res) => {
    const { cartId } = req.params
    try {
        const cart = await Cart.findOne({ _id: cartId }).populate({
            path: "products.product", // popular el campo product dentro de products[]
            model: "Product"
          });

        if (!cart) return res.status(404).json({ message: `Cart not found with id: ${cartId}` })
        if (cart.userId?.toString() !== req.user.userId) {
            return res.status(403).json({ message: "No autorizado para ver este carrito" });
        }

        res.status(200).json({ message: "Success getting cart", cart });
    } catch (err) {
        res.status(500).json({
            message: "Error getting cart",
            error: err.message
        });
    }
}

export const postProductInCertainCart = async (req, res) => {
    try {
        const { productId, cartId } = req.params
        const { amountToAdd } = req.body
        if (!isValidQuantity(amountToAdd)) {
            return res.status(400).json({ message: `La cantidad debe ser un entero entre 1 y ${MAX_QUANTITY}` });
        }

        const cartFound = await Cart.findById(cartId)
        const prodFound = await Product.findById(productId)

        if (!cartFound || !prodFound) {
            return res.status(404).json({ message: "Carrito o producto no encontrado" });
        }
        if (cartFound.userId?.toString() !== req.user.userId) {
            return res.status(403).json({ message: "No autorizado para modificar este carrito" });
        }

        const prodInCart = cartFound.products.find(prod => prod.product.toString() === prodFound._id.toString())
        if(prodInCart) {   //caso de que ya se haya agregado el prod previamente en el cart
            if (!isValidQuantity(prodInCart.quantity + amountToAdd)) {
                return res.status(400).json({ message: `No se pueden reservar más de ${MAX_QUANTITY} unidades de un producto` });
            }
            prodInCart.quantity += amountToAdd
        } else {
            cartFound.products.push({ product: prodFound, quantity: amountToAdd })      //agrega el prod al carrito 
        }
        // El stock no se toca desde el carrito: es solo un indicador de disponibilidad que fija la carga de Excel
        await cartFound.save();
        
        res.status(200).json({message: "Success adding product in cart", prodFound});
    } catch (err) {
        res.status(400).json({message: "Error posting product in cart", err});
    }
}

export const deleteProdFromCart = async (req, res) => {
    const { cartId, productId } = req.params
    if(!cartId || !productId) return res.status(400).json({message: "cartId or productId are required"});

    try {
        const cartFound = await Cart.findById(cartId)
        const productFound = await Product.findById(productId)
        if (!cartFound) return res.status(404).json({ message: `Cart not found with id: ${cartId}` });
        if (!productFound) return res.status(404).json({ message: `Product not found with id: ${productId}` });
        if (cartFound.userId?.toString() !== req.user.userId) {
            return res.status(403).json({ message: "No autorizado para modificar este carrito" });
        }

        cartFound.products = cartFound.products.filter(prod => prod.product.toString() !== productId);
        await cartFound.save();
        
        return res.status(200).json({
            message: "Product removed from cart",
            cart: cartFound,
            productDeleted: productFound
        });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
}