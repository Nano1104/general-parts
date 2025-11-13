import axios from "axios"
import Swal from 'sweetalert2'

import { API_URL } from "../../utils/api_url.js";

export const Order = ({ order }) => {
    console.log("🚀 ~ Order ~ order:", order)

    // Validación temprana
    if (!order || !order.userId) {
        return null; // o un skeleton/loader
    }

    const { _id: orderId, userId, products, totalOrder } = order
    console.log("🚀 ~ Order ~ userId:", userId.first_name)

    const handleDeleteOrder = async () => {
        try {
            const result = await Swal.fire({
                title: "¿Seguro que quieres eliminar la reserva?",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                confirmButtonColor: "#DC5F00"
            });

            if (result.isConfirmed) {
                const res = await axios.delete(`${API_URL}/api/order/${orderId}`, { withCredentials: true });
                if (res.status === 200) window.location.reload()
            }
        } catch (err) {
            console.error("Error eliminando la reserva:", err);
            Swal.fire({
                text: "Hubo un problema al eliminar la reserva. Intenta de nuevo.",
                icon: "error",
                confirmButtonColor: "#DC5F00"
            });
        }
    };

    return (
        <div key={orderId} className="bg-gray w-[70%] my-6 rounded-md p-6 font-poppins relative">
            <h3 className="text-center text-2xl font-medium">{userId.first_name} {userId.last_name}</h3>
            <div className="flex flex-col mt-4">
                <span>Id de reserva: <span className="font-semibold">{orderId}</span></span>
                <span>Telefono/Celular: <span className="font-semibold">{userId.phone}</span></span>
                <span>Mail: <span className="font-semibold">{userId.email}</span></span>
                <span>Rol: <span className="font-semibold">{userId.role}</span></span>
                <span>Total de reserva: <span className="font-semibold">${totalOrder}</span></span>
            </div>
            <hr className="mt-2" />

            <div key={`${orderId}-productsDiv`} className="mt-4 overflow-y-auto">
                <h3 className="text-xl font-medium">Productos: </h3>
                {
                    products
                        ?.filter(prod => prod.product !== null && prod.product !== undefined)
                        .map(prod => (
                            <div key={prod.product._id} className="flex justify-between ml-2 border-b-[1px]">
                                <span className="first-letter:uppercase">{prod.product.desc_stock}</span>
                                <span>Cantidad: <span className="font-semibold">x{prod.quantity}</span></span>
                            </div>
                        ))
                }
            </div>

            <button className="py-2 px-4 bg-lightRed text-white text-sm rounded-md m-4" onClick={handleDeleteOrder}>
                Cancelar Reserva
            </button>
        </div>
    )
}



