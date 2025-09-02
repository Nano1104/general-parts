import { Link } from "react-router-dom";
import { useRef } from "react";
import { useAuthContext } from "../../context/AuthContext.jsx"
//icons
import { BsSearch } from "react-icons/bs";
import { IoCartOutline } from "react-icons/io5";
//components
import { UserIcon } from "../UserIcon/UserIcon.jsx"; 


export const ProductsContainerNav = ({ searchValue, setSearchValue }) => {
    const { authUser } = useAuthContext();
    const searchInputRef = useRef(null)

    const handleSearch = (e) => {
        const value = searchInputRef.current?.value;
        setSearchValue(value || ''); // Asegura que sea string vacío si es undefined/null
    }

    return(
        <>
            <nav className="p-2 bg-deepGray">
                <ul className="px-4 grid sm:grid-cols-[1fr_45%_1fr] 2xl:grid-cols-[1fr_30%_1fr]">
                    {/* LOGO */}
                    <Link to="/" translate="no" className="text-3xl italic font-roboto lg:text-4xl 2xl:text-5xl 2xl:my-2 w-0">
                        <span className="font-extrabold text-coral tracking-tighter">SW</span>
                        <span className="font-bold text-white tracking-tight">Parts</span>
                    </Link>

                    {/* INPUTS DE INICIO DE SESION */}
                    <div className="flex justify-end font-montserrat font-bold items-center sm:order-1 gap-4 mr-2 text-white">
                        {
                            authUser
                            ? 
                            <>
                            <UserIcon />
                            {
                                authUser.role !== "admin"
                                ? 
                                <Link to="/cart-v" className="flex justify-center items-center">
                                    <IoCartOutline className="inline-block text-3xl" />
                                </Link>
                                :
                                <></>
                            }
                            </>
                            : <Link to="/authPage/login" className="text-sm rounded-[8px] relative btn-logs">Iniciar Sesión<div></div></Link>
                        }
                    </div>

                    {/* BARRA DE BUSQUEDA */}
                    <div className="mt-2 flex font-roboto items-center col-span-2 sm:col-span-1">
                        <input  
                            ref={searchInputRef}
                            type="text"
                            placeholder="Buscar..."
                            value={searchValue}
                            className="h-[30px] rounded-tl-2xl rounded-bl-2xl rounded-tr-none rounded-br-none
                            py-2 px-3 flex-grow basis-[80%] focus:outline-none"
                            onChange={(e) => setSearchValue(e.target.value)}
                            />
                        <BsSearch className="h-[30px] text-deepGray bg-white p-1 cursor-pointer rounded-tr-2xl rounded-br-2xl flex-grow basis-0" onClick={handleSearch}/>
                    </div>
                </ul>
            </nav>
        </>
    )
}