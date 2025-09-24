import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx";

//icons
import { UserIcon } from "../UserIcon/UserIcon.jsx";
import { HiBars3 } from "react-icons/hi2";
import { useState } from "react";
import { RxCross1 } from "react-icons/rx";

// NavBar Component - Optimizado y Responsivo
export const NavBar = () => {
    const { authUser } = useAuthContext();

    return (
        <nav className="fixed top-0 right-0 z-40 w-full">
            <div className="flex justify-end p-3 sm:p-4 md:p-5 lg:p-6">
                <div className="flex items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 font-montserrat lg:text-white">
                    {authUser?.role === "admin" && (
                        <>
                            <Link
                                to="/admin"
                                className="px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-2 
                                         hover:text-lightRed transition-colors duration-200 font-medium
                                         text-xs sm:text-sm md:text-base"
                            >
                                ADMINISTRADOR
                            </Link>
                            <Link
                                to="/reservas"
                                className="px-2 py-1 sm:px-3 sm:py-2 lg:px-4 lg:py-2
                                         hover:text-lightRed transition-colors duration-200 font-medium
                                         text-xs sm:text-sm md:text-base"
                            >
                                RESERVAS
                            </Link>
                        </>
                    )}

                    {authUser && (
                        <div className="ml-2 sm:ml-4">
                            <UserIcon />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}
