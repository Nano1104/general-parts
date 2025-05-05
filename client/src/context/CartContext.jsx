import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { API_URL } from "../utils/api_url.js";
import { useAuthContext } from "./AuthContext.jsx";

export const CartContext = createContext();

export const useCartContext = () => {
    return useContext(CartContext);
}

export const CartContextProvider = ({children}) => {
    const [cart, setCart] = useState([]);
    const { authUser } = useAuthContext()

    const addProductToCart = async (productId, cartId, amountToAdd) => {
        try {
            const response = await axios.post(`${API_URL}/api/cart/${cartId}/products/${productId}`, { amountToAdd }, { withCredentials: true } );
            const data = response.data

            // Actualizar estado local en lugar de recargar
            setCart(prev => {
                // Lógica para actualizar el carrito localmente
                const existingItem = prev.find(item => item.product._id === productId);
                if(existingItem) {
                    return prev.map(item => 
                        item.product._id === productId 
                            ? {...item, quantity: item.quantity + amountToAdd} 
                            : item
                    );
                }
                return [...prev, {product: data.prodFound, quantity: amountToAdd}];
            });

            console.log("🚀 ~ CartContextProvider ~ cart:", cart)

            Swal.fire({
                icon: "success",
                title: "Producto agregado",
                showConfirmButton: true,
                confirmButtonColor: "#DC5F00"
            });
        } catch (err) {
            console.error("Error:", err);
            Swal.fire({
                icon: "error",
                text: err.response?.data?.message || 'Error al agregar producto',
                confirmButtonColor: "#DC5F00"
            });
            throw err; // Permite manejar el error en el componente si es necesario
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
                    const res = await axios.delete(`${API_URL}/api/cart/${cartId}/products/${prodId}`, { withCredentials: true });
                    await axios.put(`${API_URL}/api/products/update-stock/${prodId}`, { newStock: quantity }, { withCredentials: true })
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
            const res = await axios.post(`${API_URL}/api/order`, { userId, prods, totalPrice }, { withCredentials: true})

            if (res.status === 200) {
                alert("Orden creada de manera exitosa");
                await axios.put(`${API_URL}/api/user/${userId}/cart/${cartId}`, {}, { withCredentials: true });
            } else {
                throw new Error("Error en la creación de la orden");
            }
        } catch (err) {
            console.log(err.message);
            alert("Hubo un problema al crear la orden")
        }
    }

    useEffect(() => {
        const loadCart = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/cart/${authUser.cart._id}`)
                const data = response.data
                console.log("🚀 ~ loadCart ~ data:", data)

                setCart(data.cart.products)
            } catch (err) {
                console.log("🚀 ~ loadCart ~ err:", err)
            }
        }

        loadCart()
    }, [])

    return (
        <CartContext.Provider value={{ cart, setCart, addProductToCart, handleDeleteProdFromCart, finishPurchase }}>
            {children}
        </CartContext.Provider>
    );
}