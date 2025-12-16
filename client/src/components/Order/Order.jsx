import axios from "axios"
import Swal from 'sweetalert2'

import { API_URL } from "../../utils/api_url.js";

export const Order = ({ order }) => {
    console.log("🚀 ~ Order ~ order:", order)

    // Validación temprana
    if (!order || !order.userId) {
        return null;
    }

    const { _id: orderId, userId, products, totalOrder } = order
    console.log("🚀 ~ Order ~ userId:", userId.first_name)

    const handleDeleteOrder = async () => {
        try {
            const result = await Swal.fire({
                title: "¿Seguro que quieres eliminar la reserva?",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#DC5F00",
                cancelButtonColor: "#6b7280"
            });

            if (result.isConfirmed) {
                const res = await axios.delete(`${API_URL}/api/order/${orderId}`, { withCredentials: true });
                if (res.status === 200) {
                    Swal.fire({
                        text: "Reserva eliminada correctamente",
                        icon: "success",
                        confirmButtonColor: "#DC5F00"
                    });
                    window.location.reload()
                }
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
        <div
            key={orderId}
            className="bg-gray w-full sm:w-[90%] md:w-[80%] lg:w-[70%] my-4 sm:my-6 rounded-md p-4 sm:p-6 font-poppins relative"
        >
            {/* Nombre del usuario */}
            <h3 className="text-center text-xl sm:text-2xl font-medium mb-4 break-words">
                {userId.first_name} {userId.last_name}
            </h3>

            {/* Información de la reserva */}
            <div className="flex flex-col gap-2 text-sm sm:text-base">
                <div className="flex flex-col sm:flex-row sm:gap-2">
                    <span className="font-normal">Id de reserva:</span>
                    <span className="font-semibold break-all">{orderId}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-2">
                    <span className="font-normal">Teléfono/Celular:</span>
                    <span className="font-semibold">{userId.phone}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-2">
                    <span className="font-normal">Mail:</span>
                    <span className="font-semibold break-all">{userId.email}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-2">
                    <span className="font-normal">Rol:</span>
                    <span className="font-semibold capitalize">{userId.role}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-2">
                    <span className="font-normal">Total de reserva:</span>
                    <span className="font-semibold">${totalOrder}</span>
                </div>
            </div>

            <hr className="mt-4 mb-4" />

            {/* Lista de productos */}
            <div key={`${orderId}-productsDiv`} className="max-h-[300px] overflow-y-auto">
                <h3 className="text-lg sm:text-xl font-semibold mb-3">Productos:</h3>
                <div className="space-y-2">
                    {
                        products
                            ?.filter(prod => prod.product !== null && prod.product !== undefined)
                            .map(prod => (
                                <div
                                    key={prod.product._id}
                                    className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 ml-2 pb-2 border-b-[1px] text-sm sm:text-base"
                                >
                                    <span className="first-letter:uppercase break-words">
                                        {prod.product.desc_stock}
                                    </span>
                                    <span className="whitespace-nowrap">
                                        Cantidad: <span className="font-semibold">x{prod.quantity}</span>
                                    </span>
                                </div>
                            ))
                    }
                </div>
            </div>

            {/* Botón de cancelar */}
            <button
                className="w-full sm:w-auto py-2 px-6 bg-lightRed text-white text-sm sm:text-base rounded-md mt-4 hover:bg-opacity-90 transition-colors font-medium"
                onClick={handleDeleteOrder}
            >
                Cancelar Reserva
            </button>
        </div>
    )
}