import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx"
//icons
import { BsSearch } from "react-icons/bs";
import { PiUser } from "react-icons/pi";
import { IoCartOutline } from "react-icons/io5";
//components
import { UserIcon } from "../UserIcon/UserIcon.jsx"; 


export const ProductsContainerNav = ({ searchValue, setSearchValue }) => {
    const { authUser } = useAuthContext();

    const handleSearch = (e) => {
        setSearchValue(searchValue)
    }

    return(
        <>
            <nav className="p-2 bg-[#272829] font-roboto">
                <ul className="px-4 grid sm:grid-cols-[1fr_45%_1fr] 2xl:grid-cols-[1fr_30%_1fr]">
                    <Link to="/" className="text-[2rem] w-0">
                        <span className="font-extrabold text-orange font-poppins tracking-tighter italic">SW</span>
                        <span className="font-bold text-white font-poppins tracking-tight italic">Parts</span>
                    </Link>
                    <div className="flex justify-end items-center sm:order-1 gap-4 mr-2 text-white">
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
                            : <Link to="/authPage" className="text-sm rounded-[8px] font-medium relative btn-logs">Iniciar Sesión<div></div></Link>
                        }
                    </div>
                    <div className="flex items-center col-span-2 sm:col-span-1">
                        <input type="text"
                                placeholder="Buscar..."
                                className="h-[30px] rounded-tl-2xl rounded-bl-2xl rounded-tr-none rounded-br-none py-2 px-3 flex-grow basis-[80%] focus:outline-none"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        <BsSearch className="h-[30px] text-deepGray bg-white p-1 cursor-pointer rounded-tr-2xl rounded-br-2xl flex-grow basis-0" onClick={handleSearch}/>
                    </div>
                </ul>
            </nav>
        </>
    )
}