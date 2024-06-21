import { Link } from "react-router-dom";
import { Logo } from "../Logo/Logo.jsx"

export const NavBar = () => {
    return(
        <>
        <nav className="font-montserrat py-3 px-4 text-lg text-white" id="navBar">
            <ul className="flex justify-between items-center gap-7 m-7">
                <Logo />
                <div className="flex gap-10 text-base">
                    <Link to="/productos" className="font-semibold hover:text-lightGray transition duration-200">Repuestos</Link>
                    <Link to="/contact" className="font-semibold hover:text-lightGray transition duration-200">Contáctanos</Link>
                    <Link to="/login" className="font-semibold relative btn-logs" id="btn-login">Iniciar Sesion <div></div></Link>
                    <Link to="/register" className="font-semibold relative btn-logs" id="btn-register">Registrar <div></div></Link>
                </div>
            </ul>
        </nav>
        </>
    )
}