import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import Swal from 'sweetalert2';
import { API_URL } from "../utils/api_url.js";
import { useAuthContext } from "./AuthContext.jsx";

export const CartContext = createContext();

export const useCartContext = () => {
    return useContext(CartContext);
}

export const CartContextProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const { authUser } = useAuthContext()

    //ADD PRODUCT TO CART
    const addProductToCart = async (productId, cartId, amountToAdd) => {
        // Validación para amountToAdd igual a 0
        if (amountToAdd === 0) {
            Swal.fire({
                icon: "warning",
                iconColor: "#D7263D",
                title: "Operación no válida",
                text: "No se puede agregar un producto con cantidad 0",
                confirmButtonColor: "#D7263D"
            });
            return; // Salimos de la función temprano
        }

        try {
            const response = await axios.post(`${API_URL}/api/cart/${cartId}/products/${productId}`, { amountToAdd }, { withCredentials: true });
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
                                ? { ...item, quantity: item.quantity + amountToAdd }
                                : item
                        )
                    };
                }

                return {
                    ...prev,
                    products: [...prev.products, { product: data.prodFound, quantity: amountToAdd }]
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

    //DELETE PRODUCT FROM CART
    const handleDeleteProdFromCart = async (cartId, prodId, quantity) => {
        try {
            Swal.fire({
                title: "Estas seguro que quieras eliminar el producto del carrito?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#D7263D",
                cancelButtonColor: "#D8D9DA",
                confirmButtonText: "Si, eliminar!"
            }).then(async (result) => {             // Añadir async aquí
                if (result.isConfirmed) {           // Verificar si el usuario confirmó la acción
                    const res = await axios.delete(`${API_URL}/api/cart/${cartId}/products/${prodId}`, { data: { quantity }, withCredentials: true });
                    console.log("🚀 ~ handleDeleteProdFromCart ~ res:", res)
                    // Verificar si la respuesta es exitosa
                    if (res.status === 200) {
                        // Actualizar el estado local del carrito
                        setCart(prevCart => ({
                            ...prevCart,
                            products: prevCart.products.filter(prod => prod.product._id !== prodId)
                        }));

                        Swal.fire({
                            icon: "success",
                            title: "Producto eliminado",
                            text: "El producto ha sido eliminado del carrito",
                            confirmButtonColor: "#D7263D"
                        });
                    } else {
                        throw new Error("Error al eliminar el producto del carrito");
                    }
                }
            });
        } catch (err) {
            console.error(`Error: ${err.response.data.message}`);
        }
    }

    // ---- Finalizar compra ----
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

            // 2. Vaciar el carrito en el backend
            await axios.put(
                `${API_URL}/api/user/${userId}/cart/${cart._id}`,
                {},
                { withCredentials: true }
            );

            // 3. Actualizar estado del carrito en el frontend
            setCart({ ...cart, products: [] });

            // 4. Notificación de éxito
            await Swal.fire({
                icon: "success",
                title: "¡Compra exitosa!",
                text: "Tu orden ha sido creada y el carrito vaciado",
                confirmButtonColor: "#DC5F00"
            });

            return orderResponse.data;
        } catch (err) {
            console.error("Error en finishPurchase:", err);

            let errorMessage = "Hubo un problema al procesar tu compra";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            await Swal.fire({
                icon: "error",
                title: "Error",
                text: errorMessage,
                confirmButtonColor: "#DC5F00"
            });

            throw err;
        }
    };

    // ---- Cargar carrito al iniciar sesión o cambiar de user ----
    useEffect(() => {
        if (!authUser?.cart?._id) {
            setCart(null); // Limpia carrito si no hay usuario
            return;
        }

        const source = axios.CancelToken.source();

        const loadCart = async () => {
            try {
                const res = await axios.get(
                    `${API_URL}/api/cart/${authUser.cart._id}`,
                    { cancelToken: source.token, withCredentials: true }
                );
                setCart(res.data.cart);
            } catch (err) {
                if (!axios.isCancel(err)) {
                    console.error("Error loading cart:", err);
                }
            }
        };

        loadCart();

        return () => source.cancel();
    }, [authUser?.cart?._id]);

    return (
        <CartContext.Provider value={{ cart, setCart, addProductToCart, handleDeleteProdFromCart, finishPurchase }}>
            {children}
        </CartContext.Provider>
    );
}