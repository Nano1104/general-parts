import { Link } from "react-router-dom"
//icons
import { LiaBoxSolid } from "react-icons/lia"; //box
import { PiUsers } from "react-icons/pi";
import { LuClipboardList } from "react-icons/lu";

import useLogout from "../../hooks/useLogout.js"

import Swal from 'sweetalert2'

export const AdminNavBar = () => {
    const { logOut } = useLogout()

    const handleLogOut = () => {
        Swal.fire({
            title: "Estas seguro que quiere cerrar sesión?",
            showCancelButton: true,
            confirmButtonText: "CERRAR",
            confirmButtonColor: "#DC5F00",
            cancelButtonText: `CANCELAR`
          }).then(async (result) => {
                if (result.isConfirmed) {
                    await logOut()
                }
          });
    }

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
                <button
                    type="submit"
                    className="bg-orange text-black w-[50%] border border-black rounded-md py-1 font-medium font-poppins mb-5" 
                    onClick={handleLogOut}>CERRAR SESIÓN</button>
            </nav>
        </>
    )
}