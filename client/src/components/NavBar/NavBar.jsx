import axios from "axios";
import { Link } from "react-router-dom";
import { Logo } from "../Logo/Logo.jsx"
import { FaUser } from "react-icons/fa";
import { useAuthContext } from "../../context/AuthContext.jsx";

export const NavBar = () => {
    const { authUser, setAuthUser } = useAuthContext();

    const handleLogout = async () => {
        const logout = await axios.post("/api/auth/logout", { withCredentials: true })
        setAuthUser(null)
    }
    
    return(
        <>
        <nav className="font-montserrat py-3 px-4 text-lg text-white" id="navBar">
            <ul className="flex justify-between items-center gap-7 m-7">
                <Logo />
                <div className="flex items-center gap-10 text-base">
                    <Link to="/productos" className="font-semibold hover:text-lightGray transition duration-200">Repuestos</Link>
                    <Link to="/contact" className="font-semibold hover:text-lightGray transition duration-200">Contáctanos</Link>
                    {
                        authUser
                        ? <FaUser onClick={handleLogout} className="text-[30px] bg-gray pt-1 px-1 rounded-full cursor-pointer hover:bg-slate-500 hover:scale-110 transition duration-200" />
                        : 
                        <>
                            <Link to="/login" className="font-semibold relative btn-logs" id="btn-login">Iniciar Sesion <div></div></Link>
                            <Link to="/register" className="font-semibold relative btn-logs" id="btn-register">Registrar <div></div></Link>
                        </>
                    }                    
                </div>
            </ul>
        </nav>
        </>
    )
}