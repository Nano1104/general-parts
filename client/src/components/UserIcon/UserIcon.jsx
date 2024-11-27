import "./userIcon.css"
import axios from "axios"
import { useAuthContext } from "../../context/AuthContext";
import { PiUser } from "react-icons/pi";
import { useState } from "react";

const API_URL = import.meta.env.VITE_PROD_SERVER_URL;

export const UserIcon = () => {
    const { setAuthUser, authUser } = useAuthContext();
    console.log("🚀 ~ UserIcon ~ authUser:", authUser)
    const [showMenu, setShowMenu] = useState(false);
    console.log(showMenu)
    const handleMenu = () => {
        setShowMenu(showMenu => !showMenu)
    }

    const handleLogout = async () => {
        try {
            const logout = await axios.post(`${API_URL}/api/auth/logout`, { withCredentials: true })
            console.log(logout);
            setAuthUser(null)
        } catch (err) {
            console.log("Error al tratar de hacer logout")
        }
    }

    return(
        <>
        <div className="relative">
            <PiUser onClick={handleMenu} className="text-3xl cursor-pointer hover:text-lightGray hover:scale-110 transition duration-100" />
            {
                showMenu
                ? 
                <div className="text-black text-center" id="user-menu">
                    <div className="h-full">
                        <button className="text-xs font-medium py-1 w-full rounded-tl-[20px] rounded-tr-[20px] absolute left-0 border-t
                                        hover:bg-amber-600 hover:border-transparent transition duration-200" onClick={handleLogout}>CERRAR SESIÓN</button>
                    </div>
                </div>
                : <></>
            }
        </div>
        </>
    )
}

