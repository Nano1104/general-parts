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
            }
        };

        fetchData();
    }, []);

    return (
        <>
            {
                orders && orders.length > 0
                    ?
                    <div className="w-full h-screen flex flex-col font-poppins">
                        <div className="flex items-center text-white mt-[70px] ml-[70px]">
                            <Link to="/" /* className="absolute top-0 my-7 ml-10" */>
                                <span className="font-extrabold text-lightRed tracking-tighter italic text-[4.5rem]">SW</span>
                                <span className="font-bold text-white tracking-tight italic text-[4.5rem]">Parts</span>
                            </Link>
                            <h3 className="ml-[100px] text-[1.7rem] font-montserrat">Reservas:</h3>
                        </div>

                        {/* // ORDERS */}
                        <div className="mt-10 flex flex-col items-center overflow-y-auto border-t-[1px]">
                            {orders.map(order => (
                                <Order key={order._id || order.orderId} order={order} />
                            ))}


                            <Link to="/" className="bg-lightRed w-[10%] text-center rounded-md py-1 px-2 mt-2 mb-20 text-white">Volver al Inicio</Link>
                        </div>
                    </div>
                    :       // CASO NO HAY RESERVAS
                    <div>
                        <div className="w-full h-[100vh] flex flex-col items-center text-center">
                            <div className="bg-gray w-full h-[50%] flex justify-center items-center">
                                <div className="flex relative">
                                    <LuClipboardList className="inline-block text-[17rem]" />
                                    <CiWarning className="text-[8rem] text-lightRed absolute top-0 right-0 z-50" />
                                </div>
                            </div>
                            <div className="h-[50%] text-lightGray">
                                <h1 className="text-[4rem] font-semibold tracking-tighter font-montserrat">No hay reservas realizadas!</h1>
                                <Link
                                    to="/productos"
                                    className="bg-lightRed w-[25%] rounded-md py-1 px-3 mt-2 text-cBlack font-semibold" onClick={handleNavigate}>
                                    VOLVER
                                </Link>
                            </div>
                        </div>
                    </div>
            }
        </>
    )
}