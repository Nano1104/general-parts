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
                    confirmButtonColor: "#DC5F00"
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

    const handleDeleteProdFromCart = async (cartId, prodId, quantity) => {
        try {
            Swal.fire({
                title: "Estas seguro que quieras eliminar el producto del carrito?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DC5F00",
                cancelButtonColor: "#D8D9DA",
                confirmButtonText: "Si, eliminar!"
            }).then(async (result) => {             // Añadir async aquí
                if (result.isConfirmed) {
                    const res = await axios.delete(`/api/cart/${cartId}/products/${prodId}`, { withCredentials: true });
                    await axios.put(`/api/products/update-stock/${prodId}`, { newStock: quantity }, { withCredentials: true })
                    console.log("🚀 ~ handleDeleteProdFromCart ~ res:", res);
                    window.location.reload();
                }
            });
        } catch (err) {
            console.error(`Error: ${err.response.data.message}`);
        }
    }

    const finishPurchase = async (userId, cart, totalPrice) => {
        const { _id: cartId, products: prods } = cart

        try {
            const res = await axios.post("/api/order", { userId, prods, totalPrice }, { withCredentials: true})

            if (res.status === 200) {
                alert("Orden creada de manera exitosa");
                await axios.put(`/api/user/${userId}/cart/${cartId}`, {}, { withCredentials: true });
            } else {
                throw new Error("Error en la creación de la orden");
            }
        } catch (err) {
            console.log(err.message);
            alert("Hubo un problema al crear la orden")
        }
    }

    return (
        <CartContext.Provider value={{ cart, setCart, addProductToCart, handleDeleteProdFromCart, finishPurchase }}>
            {children}
        </CartContext.Provider>
    );
}