import axios from "axios"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Order } from "../../components/Order/Order.jsx"
import { CiWarning } from "react-icons/ci";
import { LuClipboardList } from "react-icons/lu";

import { API_URL } from "../../utils/api_url.js";

export const Orders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const navigate = useNavigate()
    const handleNavigate = () => navigate(-1)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/order`, { withCredentials: true });
                console.log("🚀 ~ fetchData ~ res:", res.data.orders)
                setOrders([...res.data.orders])
            } catch (error) {
                console.error("Error fetching order data:", error);
            } finally {
                setLoading(false)
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <p className="text-white text-xl">Cargando reservas...</p>
            </div>
        )
    }

    return (
        <>
            {
                orders && orders.length > 0
                    ?
                    <div className="w-full min-h-screen flex flex-col font-poppins pb-10">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row items-center text-white mt-10 sm:mt-[70px] px-4 sm:ml-[70px] gap-4 sm:gap-0">
                            <Link to="/" className="text-center sm:text-left">
                                <span className="font-extrabold text-lightRed tracking-tighter italic text-5xl sm:text-6xl md:text-[4.5rem]">SW</span>
                                <span className="font-bold text-white tracking-tight italic text-5xl sm:text-6xl md:text-[4.5rem]">Parts</span>
                            </Link>
                            <h3 className="sm:ml-[100px] text-xl sm:text-2xl md:text-[1.7rem] font-montserrat">Reservas:</h3>
                        </div>

                        {/* Orders List */}
                        <div className="mt-6 sm:mt-10 flex flex-col items-center overflow-y-auto border-t-[1px] px-4">
                            {orders.map(order => (
                                <Order key={order._id || order.orderId} order={order} />
                            ))}

                            <Link
                                to="/"
                                className="bg-lightRed w-full sm:w-[50%] md:w-[30%] lg:w-[15%] text-center rounded-md py-2 px-4 mt-4 mb-10 text-white font-medium hover:bg-opacity-90 transition-colors"
                            >
                                Volver al Inicio
                            </Link>
                        </div>
                    </div>
                    :
                    // CASO NO HAY RESERVAS
                    <div className="w-full min-h-screen flex flex-col">
                        <div className="w-full h-[50vh] sm:h-[50vh] flex justify-center items-center bg-gray px-4">
                            <div className="flex relative">
                                <LuClipboardList className="inline-block text-[8rem] sm:text-[12rem] md:text-[17rem]" />
                                <CiWarning className="text-[4rem] sm:text-[6rem] md:text-[8rem] text-lightRed absolute -top-2 -right-2 sm:top-0 sm:right-0 z-50" />
                            </div>
                        </div>
                        <div className="h-[50vh] flex flex-col justify-center items-center text-cBlack px-4 text-center">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[4rem] font-semibold tracking-tighter font-montserrat mb-4">
                                No hay reservas realizadas!
                            </h1>
                            <Link
                                to="/productos"
                                className="bg-lightRed mt-6 text-white d w-full sm:w-[60%] md:w-[40%] lg:w-[25%] rounded-md py-2 px-4 font-semibold hover:bg-opacity-90 transition-colors"
                                onClick={handleNavigate}
                            >
                                VOLVER
                            </Link>
                        </div>
                    </div>
            }
        </>
    )
}