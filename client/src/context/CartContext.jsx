import axios from "axios";
import { createContext, useContext, useState } from "react";
import Swal from 'sweetalert2';


export const CartContext = createContext();

export const useCartContext = () => {
    return useContext(CartContext);
}

export const CartContextProvider = ({children}) => {
    const [cart, setCart] = useState([]);

    const addProductToCart = async (productId, cartId, amountToAdd) => {
        try {
            const res = await axios.post(`/api/cart/${cartId}/products/${productId}`, { amountToAdd }, { withCredentials: true });
            console.log("🚀 ~ addProductToCart ~ res:", res)
            if(res.status == 200) {
                Swal.fire({
                    icon: "success",
                    title: "Producto agregado",
                    showConfirmButton: true,
                }).then((result) => {
                    if (result.isConfirmed) {   // Recargar la página cuando se confirme
                        window.location.reload();
                    }
                });
            }
        } catch (err) {
            console.error(`Error: ${err.response.data.message}`);
            return `Error: ${err.response.data.message || 'Ocurrió un error al agregar el producto al carrito.'}`;
        }
    }

    const handleDeleteProdFromCart = async (cartId, prodId) => {
        console.log(cartId, prodId);
        try {
            const res = await axios.delete(`/api/cart/${cartId}/products/${prodId}`, { withCredentials: true });
            console.log("🚀 ~ handleDeleteProdFromCart ~ res:", res)
            window.location.reload();
        } catch (err) {
            console.error(`Error: ${err.response.data.message}`);
        }
    }

    return (
        <CartContext.Provider value={{ cart, setCart, addProductToCart, handleDeleteProdFromCart }}>
            {children}
        </CartContext.Provider>
    );
}