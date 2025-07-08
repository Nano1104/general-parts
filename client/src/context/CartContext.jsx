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
            console.log("🚀 ~ addProductToCart ~ data:", data)
            console.log(cart)
            // Actualizar estado local en lugar de recargar
            setCart(prev => {
                console.log("🚀 ~ addProductToCart ~ prev:", prev);
                
                // Asegúrate de que prev.products existe y es un array
                const existingItem = prev.products.find(item => item.product._id === productId);
                
                if (existingItem) {
                    return {
                        ...prev, // Mantén todas las otras propiedades del carrito
                        products: prev.products.map(item => 
                            item.product._id === productId 
                                ? {...item, quantity: item.quantity + amountToAdd} 
                                : item
                        )
                    };
                }
                
                return {
                    ...prev,
                    products: [...prev.products, {product: data.prodFound, quantity: amountToAdd}]
                };
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
        if (!userId || !cart?._id || !Array.isArray(cart.products)) {
            throw new Error("Datos de compra inválidos");
        }

        try {
            // 1. Crear la orden
            const orderResponse = await axios.post(
                `${API_URL}/api/order`, 
                { 
                    userId, 
                    prods: cart.products, 
                    totalPrice 
                }, 
                { withCredentials: true }
            );

            if (orderResponse.status !== 200) {
                throw new Error("Error en la creación de la orden");
            }

            // 2. Vaciar el carrito (solo si la orden fue exitosa)
            await axios.put(
                `${API_URL}/api/user/${userId}/cart/${cart._id}`, 
                {}, 
                { withCredentials: true }
            );

            // 3. Notificación de éxito
            await Swal.fire({
                icon: 'success',
                title: '¡Compra exitosa!',
                text: 'Tu orden ha sido creada y el carrito vaciado',
                confirmButtonColor: '#DC5F00'
            });

            return orderResponse.data;

        } catch (err) {
            console.error("Error en finishPurchase:", err);
            
            let errorMessage = "Hubo un problema al procesar tu compra";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonColor: '#DC5F00'
            });

            throw err; // Permite manejo adicional en el componente
        }
    };

    useEffect(() => {
        if (!authUser?.cart?._id) {
            setCart(null); // Limpia carrito si no hay usuario
            return;
        }

        const source = axios.CancelToken.source();
        
        const loadCart = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/cart/${authUser.cart._id}`, {
                    cancelToken: source.token
                });
                console.log("🚀 ~ loadCart ~ res:", res.data)
                setCart(res.data.cart);
            } catch (err) {
                if (!axios.isCancel(err)) {
                    console.error('Error loading cart:', err);
                }
            }
        };

        loadCart();
        
        return () => source.cancel();
    }, [authUser?.cart?._id]); // Se recalcula solo si cambia el ID

    return (
        <CartContext.Provider value={{ cart, setCart, addProductToCart, handleDeleteProdFromCart, finishPurchase }}>
            {children}
        </CartContext.Provider>
    );
}