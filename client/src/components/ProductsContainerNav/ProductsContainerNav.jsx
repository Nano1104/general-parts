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
            <nav className="p-2 bg-[#272829]">
                <ul className="px-4 grid sm:grid-cols-[1fr_45%_1fr] 2xl:grid-cols-[1fr_30%_1fr]">
                    <Link to="/" className="mobile:text-[2rem] italic font-roboto xl:text-[3em] w-0">
                        <span className="font-extrabold text-orange tracking-tighter">SW</span>
                        <span className="font-bold text-white tracking-tight">Parts</span>
                    </Link>
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
                            : <Link to="/authPage" className="text-sm rounded-[8px] relative btn-logs">Iniciar Sesión<div></div></Link>
                        }
                    </div>
                    <div className="flex font-roboto items-center col-span-2 sm:col-span-1">
                        <input  
                            ref={searchInputRef}
                            type="text"
                            placeholder="Buscar..."
                            className="h-[30px] rounded-tl-2xl rounded-bl-2xl rounded-tr-none rounded-br-none py-2 px-3 flex-grow basis-[80%] focus:outline-none"
                                /* onChange={(e) => setSearchValue(e.target.value)} */
                            />
                        <BsSearch className="h-[30px] text-deepGray bg-white p-1 cursor-pointer rounded-tr-2xl rounded-br-2xl flex-grow basis-0" onClick={handleSearch}/>
                    </div>
                </ul>
            </nav>
        </>
    )
}