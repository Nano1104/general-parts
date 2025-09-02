import { useAuthContext } from "../../context/AuthContext";
import { PiUser } from "react-icons/pi";
import { useState } from "react";
import useLogout from "../../hooks/useLogout.js"

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
            {showMenu ? (
                <div className="bg-cWhite absolute top-14 -left-28 w-40 h-48 rounded-2xl text-black text-center shadow-lg z-10">
                    {/* Triángulo (pseudo-elemento ::before) */}
                    <div className="absolute bg-cWhite rotate-45 w-6 h-6 -top-2 right-5"></div>

                    {/* Contenido del menú */}
                    <div className="h-32 w-full flex flex-col">
                        <span className="mt-4">{authUser.first_name} {authUser.last_name}</span>
                        <span className="italic font-normal">- {authUser.role} -</span>
                    </div>

                    {/* Botón de cerrar sesión */}
                    <button onClick={handleLogout}
                            className="text-xs font-medium py-1 w-full absolute bottom-0 left-0 rounded-bl-2xl rounded-br-2xl
                                hover:bg-coral hover:border-transparent transition duration-200">
                        CERRAR SESIÓN
                    </button>
                </div>
                ) : (<></>)
            }
        </div>
        </>
    )
}

