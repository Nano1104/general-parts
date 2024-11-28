import "./userIcon.css"
import axios from "axios"
import { useAuthContext } from "../../context/AuthContext";
import { PiUser } from "react-icons/pi";
import { useState } from "react";
import useLogout from "../../hooks/useLogout.js"
import { API_URL } from "../../utils/api_url.js";

export const UserIcon = () => {
    const { logOut } = useLogout();
    const { setAuthUser, authUser } = useAuthContext();
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = async () => {
        try {
            await logOut().then(res => console.log("🚀 ~ handleLogout ~ res:", res))
        } catch (err) {
            console.log("Error al tratar de hacer logout")
        }
    }

    return(
        <>
        <div className="relative">
            <PiUser onClick={() => setShowMenu(showMenu => !showMenu)} className="text-3xl cursor-pointer hover:text-lightGray hover:scale-110 transition duration-100" />
            {
                showMenu
                ? 
                <div className="text-black text-center" id="user-menu">
                    <div className="h-32 absolute w-full z-10 flex flex-col">
                        <span className="mt-4">{authUser.first_name} {authUser.last_name}</span>
                        <span className="italic font-normal">- {authUser.role} -</span>
                    </div>
                    <button onClick={handleLogout} className="text-xs font-medium py-1 w-full absolute bottom-0 left-0 z-10 rounded-bl-[20px] rounded-br-[20px]
                                                            hover:bg-amber-600 hover:border-transparent transition duration-200">CERRAR SESIÓN</button>
                </div>
                : <></>
            }
        </div>
        </>
    )
}

