import { Link } from "react-router-dom";

export const NavBar = () => {
    return(
        <>
        <nav className="bg-lightGray font-roboto py-3 px-4">
            <ul className="flex justify-end gap-3 mr-7">
                <li>
                    <Link to="/login" className="font-normal hover:font-medium">Iniciar Sesion</Link>
                </li>
                <li>
                    <Link to="/login" className="font-normal hover:font-medium">Registrar</Link>
                </li>
            </ul>
        </nav>
        </>
    )
}