import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx"
//icons
import { BsSearch } from "react-icons/bs";
import { PiUser } from "react-icons/pi";
import { IoCartOutline } from "react-icons/io5";
//components
import { Logo } from "../Logo/Logo.jsx"


export const ProductsContainerNav = ({ searchValue, setSearchValue }) => {
    const { authUser } = useAuthContext();

    const handleSearch = (e) => {
        setSearchValue(searchValue)
    }

    return(
        <>
            <nav className="p-2 bg-[#272829]">
                <ul className="flex justify-between items-center px-4">
                    <Link to="/" className="text-[2rem]">
                        <span className="font-extrabold text-orange font-poppins tracking-tighter italic">SW</span>
                        <span className="font-bold text-white font-poppins tracking-tight italic">Parts</span>
                    </Link>
                    <div className="flex items-center basis-[20%] h-[32px] rounded-2xl">
                        <input type="text"
                                placeholder="Buscar..."
                                className="h-[30px] rounded-tl-2xl rounded-bl-2xl py-2 px-3 flex-grow basis-[80%] focus:outline-none font-poppins"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        <BsSearch className="h-[30px] text-deepGray bg-white py-1 px-1 cursor-pointer rounded-tr-2xl rounded-br-2xl flex-grow basis-0" onClick={handleSearch}/>
                    </div>
                    <div className="flex items-center gap-4 mr-2 text-white">
                        {
                            authUser
                            ? 
                            <>
                            <PiUser className="text-3xl" />
                            <Link to="/cart-v" className="flex justify-center items-center">
                                <IoCartOutline className="inline-block text-3xl" />
                            </Link>
                            </>
                            : <Link to="/authPage" className="font-semibold relative btn-logs">Iniciar Sesión<div></div></Link>
                        }
                    </div>
                </ul>
            </nav>
        </>
    )
}