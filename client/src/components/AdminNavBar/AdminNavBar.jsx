import { useState } from "react"
import { Link } from "react-router-dom"
//icons
import { LiaBoxSolid } from "react-icons/lia"; //box
import { PiUsers } from "react-icons/pi";
import { LuClipboardList } from "react-icons/lu";
import { IoMenu } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
//hooks
import useLogout from "../../hooks/useLogout.js"
//alert
import Swal from 'sweetalert2'

export const AdminNavBar = () => {
    const { logOut } = useLogout()
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleLogOut = () => {
        Swal.fire({
            title: "Estas seguro que quiere cerrar sesión?",
            showCancelButton: true,
            confirmButtonText: "CERRAR",
            confirmButtonColor: "#D7263D",
            cancelButtonText: `CANCELAR`
        }).then(async (result) => {
            if (result.isConfirmed) {
                await logOut()
            }
        });
    }

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

    return (
        <>
            {/* DESKTOP SIDEBAR - Hidden on mobile */}
            <nav className="hidden md:flex bg-cBlack md:basis-[20%] lg:basis-[15%] md:rounded-tl-2xl md:rounded-bl-2xl lg:rounded-tl-3xl lg:rounded-bl-3xl flex-col justify-between items-center py-4">
                <div className="mt-1 px-2">
                    <Link to="/" className="text-[2.2rem] lg:text-[2.7rem] block text-center">
                        <span className="font-extrabold text-lightRed font-poppins tracking-tighter italic">SW</span>
                        <span className="font-bold text-cWhite font-poppins tracking-tight italic">Parts</span>
                    </Link>
                    <ul className="font-poppins ml-6 text-base lg:text-lg mt-4">
                        <Link to="/admin/users" className="flex items-center my-1 text-cWhite hover:text-lightRed transition-colors">
                            <PiUsers className="text-xl mr-2" /><span>Usuarios</span>
                        </Link>
                        <Link to="/admin/products" className="flex items-center my-1 text-cWhite hover:text-lightRed transition-colors">
                            <LiaBoxSolid className="text-xl mr-2" /><span>Productos</span>
                        </Link>
                        <Link to="/admin/orders" className="flex items-center my-1 text-cWhite hover:text-lightRed transition-colors">
                            <LuClipboardList className="text-xl mr-2" /><span>Pedidos</span>
                        </Link>
                    </ul>
                </div>

                <div className="flex flex-col w-full items-center px-3">
                    {/*  BACK TO HOME BUTTON */}
                    <Link to={"/productos"} className="bg-lightRed text-cWhite w-full max-w-[180px] text-center rounded-md py-2 font-semibold font-poppins mb-3 text-sm hover:bg-opacity-90 transition-all">
                        VOLVER A PRODUCTOS
                    </Link>
                    {/* LOGOUT BUTTON */}
                    <button
                        type="button"
                        className="bg-lightRed text-cWhite w-full max-w-[180px] rounded-md py-2 font-semibold font-poppins mb-3 text-sm hover:bg-opacity-90 transition-all"
                        onClick={handleLogOut}>
                        CERRAR SESIÓN
                    </button>
                </div>
            </nav>

            {/* MOBILE HEADER - Only visible on mobile */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-deepGray z-50 px-4 py-3 flex justify-between items-center shadow-lg">
                <Link to="/" className="text-[1.8rem]">
                    <span className="font-extrabold text-lightRed font-poppins tracking-tighter italic">SW</span>
                    <span className="font-bold text-cWhite font-poppins tracking-tight italic">Parts</span>
                </Link>
                <button
                    onClick={toggleMenu}
                    className="text-cWhite text-3xl p-2 hover:text-lightRed transition-colors"
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <IoClose /> : <IoMenu />}
                </button>
            </div>

            {/* MOBILE MENU OVERLAY */}
            {isMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={toggleMenu}
                />
            )}

            {/* MOBILE MENU DRAWER */}
            <div className={`md:hidden fixed top-0 left-0 bottom-0 w-[75%] max-w-[280px] bg-deepGray z-50 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}>
                <div className="flex flex-col h-full py-4">
                    {/* Logo */}
                    <div className="px-4 mb-8 border-b border-gray-600 pb-4">
                        <Link to="/" className="text-[2rem] block text-center" onClick={toggleMenu}>
                            <span className="font-extrabold text-lightRed font-poppins tracking-tighter italic">SW</span>
                            <span className="font-bold text-cWhite font-poppins tracking-tight italic">Parts</span>
                        </Link>
                    </div>

                    {/* Menu Links */}
                    <div className="px-4 flex-1">
                        <ul className="font-poppins text-base text-cWhite">
                            <Link to="/admin/users" className="flex items-center my-3 hover:text-lightRed transition-colors" onClick={toggleMenu}>
                                <PiUsers className="text-xl mr-3" />
                                <span>Usuarios</span>
                            </Link>
                            <Link to="/admin/products" className="flex items-center my-3 hover:text-lightRed transition-colors" onClick={toggleMenu}>
                                <LiaBoxSolid className="text-xl mr-3" />
                                <span>Productos</span>
                            </Link>
                            <Link to="/admin/orders" className="flex items-center my-3 hover:text-lightRed transition-colors" onClick={toggleMenu}>
                                <LuClipboardList className="text-xl mr-3" />
                                <span>Pedidos</span>
                            </Link>
                        </ul>
                    </div>

                    {/* Bottom Buttons */}
                    <div className="px-4 space-y-3 border-t border-gray-600 pt-4">
                        <Link
                            to="/productos"
                            className="block bg-lightRed text-white text-center rounded-md py-2 font-medium font-poppins text-sm hover:bg-opacity-90 transition-all"
                            onClick={toggleMenu}
                        >
                            VOLVER A PRODUCTOS
                        </Link>
                        <button
                            type="button"
                            className="w-full bg-lightRed text-white rounded-md py-2 font-medium font-poppins text-sm hover:bg-opacity-90 transition-all"
                            onClick={() => {
                                toggleMenu();
                                handleLogOut();
                            }}
                        >
                            CERRAR SESIÓN
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}