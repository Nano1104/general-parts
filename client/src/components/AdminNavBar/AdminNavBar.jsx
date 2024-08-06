import { Link } from "react-router-dom"

//icons
import { LiaBoxSolid } from "react-icons/lia"; //box
import { PiUsers } from "react-icons/pi";
import { GoHome } from "react-icons/go";
import { LuClipboardList } from "react-icons/lu";

export const AdminNavBar = () => {
    return(
        <>
            <nav className="bg-deepGray basis-[15%] rounded-tl-3xl rounded-bl-3xl flex flex-col justify-between items-center">
                <div className="mt-1">
                    <Link to="/" className="text-[2.7rem]">
                        <span className="font-extrabold text-orange font-poppins tracking-tighter italic">SW</span>
                        <span className="font-bold text-white font-poppins tracking-tight italic">Parts</span>
                    </Link>
                    <ul className="font-poppins text-lg">
                        <Link to="/admin/users" className="flex items-center my-1">
                            <PiUsers className="text-xl" /><span>Usuarios</span>
                        </Link>
                        <Link to="/admin/products" className="flex items-center my-1">
                            <LiaBoxSolid className="text-xl" /><span>Productos</span>
                        </Link>
                        <Link to="/admin/orders" className="flex items-center my-1">
                            <LuClipboardList className="text-xl" /><span>Pedidos</span>
                        </Link>
                    </ul>
                </div>
                <button className="bg-red w-[50%] rounded-md py-1 text-gray font-medium font-poppins mb-5" type="submit">CERRAR SESIÓN</button>
            </nav>
        </>
    )
}