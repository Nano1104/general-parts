import axios from "axios";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx";

import { PiUser } from "react-icons/pi";
import { FaUser } from "react-icons/fa";

export const NavBar = () => {
    const { authUser, setAuthUser } = useAuthContext();

    const handleLogout = async () => {
        const logout = await axios.post("/api/auth/logout", { withCredentials: true })
        setAuthUser(null)
    }
    
    return(
        <>
        <nav className="font-montserrat py-3 px-4 text-lg text-white">
            <ul className="flex justify-end items-center gap-7 m-7">
                <div className="flex items-center gap-10 text-base">
                    { authUser && authUser.role === "admin" ? <Link to="/admin" className="font-semibold hover:text-lightGray hover:scale-110 transition duration-200">Administrador</Link> : <></> }
                    <Link to="/productos" className="font-semibold hover:text-lightGray hover:scale-110 transition duration-200">Repuestos</Link>
                    <Link to="/contact" className="font-semibold hover:text-lightGray hover:scale-110 transition duration-200">Contáctanos</Link>
                    {
                        authUser
                        ? <PiUser onClick={handleLogout} className="text-3xl cursor-pointer hover:text-lightGray hover:scale-110 transition duration-100" />
                        : 
                        <>
                            <Link to="/authPage" className="font-semibold relative btn-logs">Iniciar Sesión<div></div></Link>
                            {/* <Link to="/register" className="font-semibold relative btn-logs" id="btn-register">Registrar <div></div></Link> */}
                        </>
                    }                    
                </div>
            </ul>
        </nav>
        </>
    )
}


{/* <FaUser onClick={handleLogout} className="text-[30px] bg-gray pt-1 px-1 rounded-full cursor-pointer hover:bg-slate-500 hover:scale-110 transition duration-200" /> */}