import axios from "axios";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx";

import { FaUser } from "react-icons/fa";
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
        <div className="text-[2rem] sm:text-[3.5rem] z-20 absolute top-0 text-white lg:hidden">
            <HiBars3 onClick={handleMenuBurger} className="m-2" />
        </div>

        {
            showMenu
            ? 
            <nav className="bg-lightGray font-montserrat text-[1rem] flex flex-col items-center py-2 px-4 h-screen w-[40%] z-40 absolute lg:hidden">
                <RxCross1 onClick={handleMenuBurger} className="mt-4 sm:mt-10 text-[2em] sm:text-[3.5em]" />
                <ul className="flex flex-col relative items-center mt-16 gap-4 w-full h-[80%] sm:text-[1.5em]">
                    {/* { authUser && authUser.role === "admin"
                    ? 
                    <>
                        <Link to="/admin" className="font-semibold hover:text-lightGray hover:scale-110 transition duration-200">Administrador</Link>
                        <Link to="/reservas" className="font-semibold hover:text-lightGray hover:scale-110 transition duration-200">Reservas</Link>
                    </>
                    : <></>
                    } */}
                    { authUser && authUser.role === "admin"
                        ? 
                        <>
                        <Link to="/admin" className="font-semibold">Administrador</Link>
                        <Link to="/reservas" className="font-semibold">Reservas</Link>
                        </>
                        : <></>
                    }
                    <Link to="/contact" className="font-semibold">Contáctanos</Link>
                    <Link to="/authPage" className="font-semibold absolute border py-1 px-2 rounded-md bg-orange text-xs bottom-[50px] sm:text-[1em] sm:py-2 sm:px-4">Iniciar Sesión<div></div></Link>
                </ul>
            </nav>
            : <></>
        }


        <nav className="hidden absolute top-0 w-full font-montserrat text-[2rem] text-white lg:block">
            <ul className="flex justify-end items-center gap-7 m-7">
                <div className="flex items-center gap-10 text-base">
                    { authUser && authUser.role === "admin"
                        ? 
                        <>
                            <Link to="/admin" className="font-semibold hover:text-lightGray hover:scale-110 transition duration-200">Administrador</Link>
                            <Link to="/reservas" className="font-semibold hover:text-lightGray hover:scale-110 transition duration-200">Reservas</Link>
                        </>
                        : <></>
                    }
                    <Link to="/contact" className="font-semibold hover:text-lightGray hover:scale-110 transition duration-200">Contáctanos</Link>
                    {
                        authUser
                        ? <UserIcon />
                        : 
                        <>
                            <Link to="/authPage" className="font-semibold relative btn-logs">Iniciar Sesión<div></div></Link>
                        </>
                    }                    
                </div>
            </ul>
        </nav>
        </>
    )
}
