import axios from "axios";
import { createContext, useContext, useState } from "react";

export const CartContext = createContext();

export const useCartContext = () => {
    return useContext(CartContext);
}

export const CartContextProvider = ({children}) => {
    const [cart, setCart] = useState([]);

    const addProductToCart = async (productId, cartId, amountToAdd) => {
        try {
            const res = await axios.post(`/api/products`, { withCredentials: true });
        } catch (err) {
            
        }
    }

    return (
        <CartContext.Provider value={{ cart, setCart, addProductToCart }}>
            {children}
        </CartContext.Provider>
    );
}