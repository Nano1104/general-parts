import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

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
            prodInCart.quantity += amountToAdd
        } else {
            cartFound.products.push({ product: prodFound, quantity: amountToAdd })      //agrega el prod al carrito 
        }
        prodFound.stock = Math.max(prodFound.stock - amountToAdd, 0); //actualiza el stock del producto, asegurando que no sea negativo
        await prodFound.save(); // Guarda los cambios en el producto
        await cartFound.save();
        
        res.status(200).json({message: "Success adding product in cart", prodFound});
    } catch (err) {
        res.status(400).json({message: "Error posting product in cart", err});
    }
}

export const deleteProdFromCart = async (req, res) => {
    const { cartId, productId } = req.params
    const { quantity } = req.body;
    console.log("🚀 ~ deleteProdFromCart ~ quantity:", quantity, typeof quantity)
    if(!cartId || !productId) return res.status(400).json({message: "cartId or productId are required", err});

    try {
        const cartFound = await Cart.findById(cartId)
        const productFound = await Product.findById(productId)
        if (!cartFound) return res.status(404).json({ message: `Cart not found with id: ${cartId}` });
        if (!productFound) return res.status(404).json({ message: `Product not found with id: ${productId}` });
        if (cartFound.userId?.toString() !== req.user.userId) {
            return res.status(403).json({ message: "No autorizado para modificar este carrito" });
        }

        productFound.stock += quantity; // Aumenta el stock del producto eliminado
        await productFound.save(); // Guarda los cambios en el producto

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