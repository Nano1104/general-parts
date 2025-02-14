import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx";

import { UserIcon } from "../UserIcon/UserIcon.jsx";
import { HiBars3 } from "react-icons/hi2";
import { useState } from "react";
import { RxCross1 } from "react-icons/rx";

export const NavBar = () => {
    const { authUser } = useAuthContext();
    const [showMenu, setShowMenu] = useState(false);

    const handleMenuBurger = () => setShowMenu(showMenu => !showMenu)
 
    return(
        <>
        <div className="text-[2rem] sm:text-[3em] absolute top-0 text-white lg:hidden">
            <HiBars3 onClick={handleMenuBurger} className="m-2" />
        </div>

        {
            showMenu
            ? 
            <nav className="bg-lightGray font-roboto text-[1rem] flex flex-col items-center py-2 px-4 h-screen w-[40%] z-40 absolute top-0 lg:hidden">
                <RxCross1 onClick={handleMenuBurger} className="mt-4 sm:mt-10 text-[2em]" />
                <ul className="flex flex-col relative items-center mt-16 gap-4 w-full h-[80%] sm:text-[1.2em]">
                    { authUser && authUser.role === "admin"
                        ? 
                        <>
                        <Link to="/admin" className="font-medium">Administrador</Link>
                        <Link to="/reservas" className="font-medium">Reservas</Link>
                        </>
                        : <></>
                    }
                    <Link to="/contact" className="font-medium">Contáctanos</Link>
                    <Link to="/authPage" className="font-medium absolute border py-1 px-2 rounded-md bg-orange text-xs bottom-[50px] text-center sm:text-[.8em] sm:py-2 sm:px-4">Iniciar Sesión<div></div></Link>
                </ul>
            </nav>
            : <></>
        }


        <nav className="hidden absolute top-0 w-full text-sm font-roboto text-white lg:block">
            <ul className="flex font-medium justify-end items-center gap-7 m-7">
                <div className="flex items-center gap-10">
                    { authUser && authUser.role === "admin"
                        ? 
                        <>
                            <Link to="/admin" className="hover:text-lightGray hover:scale-110 transition duration-200">Administrador</Link>
                            <Link to="/reservas" className="hover:text-lightGray hover:scale-110 transition duration-200">Reservas</Link>
                        </>
                        : <></>
                    }
                    <Link to="/contact" className="hover:text-lightGray hover:scale-110 transition duration-200">Contáctanos</Link>
                    {
                        authUser
                        ? <UserIcon />
                        : 
                        <>
                            <Link to="/authPage" className="relative btn-logs">Iniciar Sesión<div></div></Link>
                        </>
                    }                    
                </div>
            </ul>
        </nav>
        </>
    )
}
