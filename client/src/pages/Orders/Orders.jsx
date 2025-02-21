import axios from "axios"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import { Order } from "../../components/Order/Order.jsx"
import { CiWarning } from "react-icons/ci";
import { LuClipboardList } from "react-icons/lu";

import { API_URL } from "../../utils/api_url.js";

export const Orders = () => {
    const [orders, setOrders] = useState([])

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
            orders
            ?
            <div className="w-full h-screen flex flex-col">
                <div className="flex items-center text-white mt-[70px] ml-[70px]">
                    <Link to="/" /* className="absolute top-0 my-7 ml-10" */>
                        <span className="font-extrabold text-orange font-poppins tracking-tighter italic text-[4.5rem]">SW</span>
                        <span className="font-bold text-white font-poppins tracking-tight italic text-[4.5rem]">Parts</span>
                    </Link>
                    <h3 className="ml-[100px] text-[1.7rem] font-montserrat">Reservas:</h3>
                </div>

                <div className="flex flex-grow mt-10 flex-wrap justify-around overflow-y-auto border-t-[1px] border-white">
                    { orders.map(order => <Order order={order} />) }
                </div>
            </div>
            :
            <div>
            <div className="w-full h-[100vh] flex flex-col items-center text-center">
                <div className="bg-gray w-full h-[50%] flex justify-center items-center">
                    <div className="flex relative">
                        <LuClipboardList className="inline-block text-[17rem]" />
                        <CiWarning className="text-[8rem] text-orange absolute top-0 right-0 z-50" />
                    </div>
                </div>
                <div className="h-[50%] text-lightGray">
                    <h1 className="text-[4rem] font-semibold tracking-tighter font-montserrat">No hay reservas realizadas!</h1>
                    <Link to="/productos"
                            className="mt-5 bg-orange py-2 px-4 rounded-md font-medium text-black hover:border-2" onClick={handleNavigate}>
                        VOLVER
                    </Link>
                </div>
            </div>
        </div>
        }
        </>
    )
}