import axios from "axios"
import Swal from 'sweetalert2'

import { API_URL } from "../../utils/api_url.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

// Fecha de la reserva: createdAt en las nuevas; en las viejas se deduce del ObjectId
const orderDate = (order) => new Date(order.createdAt ?? parseInt(order._id.substring(0, 8), 16) * 1000);

// Las reservas nuevas guardan copia de cada línea; las viejas solo tienen el producto populado
const orderLines = (products = []) => products.map(line => ({
    codpro: line.codpro ?? line.product?.codpro,
    desc: line.desc_stock ?? line.product?.desc_stock ?? "Producto eliminado",
    unitPrice: line.unitPrice,
    quantity: line.quantity,
}));

export const Order = ({ order }) => {
    if (!order) return null;

    const { _id: orderId, products, totalOrder, subtotal, discounts } = order
    // Usuario actual si existe; si fue borrado, la copia guardada en la reserva (si la tiene)
    const customer = order.userId ?? order.customer ?? {}
    const userDeleted = !order.userId
    const appliedDiscounts = discounts
        ? [discounts.discount_1, discounts.discount_2, discounts.discount_3].filter(d => d > 0)
        : []

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
                {customer.first_name ?? "Usuario eliminado"} {customer.last_name ?? ""}
                {userDeleted && customer.first_name && (
                    <span className="block text-sm font-normal">(usuario eliminado)</span>
                )}
            </h3>

            {/* Información de la reserva */}
            <div className="flex flex-col gap-2 text-sm sm:text-base">
                <div className="flex flex-col sm:flex-row sm:gap-2">
                    <span className="font-normal">Fecha:</span>
                    <span className="font-semibold">
                        {orderDate(order).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-2">
                    <span className="font-normal">Id de reserva:</span>
                    <span className="font-semibold break-all">{orderId}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-2">
                    <span className="font-normal">Teléfono/Celular:</span>
                    <span className="font-semibold">{customer.phone ?? "—"}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-2">
                    <span className="font-normal">Mail:</span>
                    <span className="font-semibold break-all">{customer.email ?? "—"}</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:gap-2">
                    <span className="font-normal">CUIT:</span>
                    <span className="font-semibold">{customer.cuit ?? "—"}</span>
                </div>

                {subtotal !== undefined && appliedDiscounts.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:gap-2">
                        <span className="font-normal">Subtotal (lista):</span>
                        <span className="font-semibold">
                            {formatCurrency(subtotal)} — descuentos {appliedDiscounts.map(d => `${d}%`).join(" + ")}
                        </span>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row sm:gap-2">
                    <span className="font-normal">Total de reserva:</span>
                    <span className="font-semibold">{formatCurrency(totalOrder)}</span>
                </div>
            </div>

            <hr className="mt-4 mb-4" />

            {/* Lista de productos */}
            <div key={`${orderId}-productsDiv`} className="max-h-[300px] overflow-y-auto">
                <h3 className="text-lg sm:text-xl font-semibold mb-3">Productos:</h3>
                <div className="space-y-2">
                    {orderLines(products).map((line, i) => (
                        <div
                            key={`${orderId}-${i}`}
                            className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 ml-2 pb-2 border-b-[1px] text-sm sm:text-base"
                        >
                            <span className="first-letter:uppercase break-words">
                                {line.codpro && <span className="font-semibold mr-2">{line.codpro}</span>}
                                {line.desc}
                            </span>
                            <span className="whitespace-nowrap">
                                Cantidad: <span className="font-semibold">x{line.quantity}</span>
                                {line.unitPrice !== undefined && <> · {formatCurrency(line.unitPrice)} c/u</>}
                            </span>
                        </div>
                    ))}
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
