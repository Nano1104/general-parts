import { useAuthContext } from "../../context/AuthContext";
import { PiUser, PiSignOut } from "react-icons/pi";
import { useState, useRef, useEffect } from "react";
import useLogout from "../../hooks/useLogout.js";

export const UserIcon = () => {
    const { logOut } = useLogout();
    const { authUser } = useAuthContext();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    // Cerrar con click-outside y Escape
    useEffect(() => {
        if (!showMenu) return;

        const handleClickOutside = (e) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target) &&
                !buttonRef.current.contains(e.target)
            ) {
                setShowMenu(false);
            }
        };
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                setShowMenu(false);
                buttonRef.current?.focus();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [showMenu]);

    const handleLogout = async () => {
        try {
            await logOut();
        } catch (err) {
            console.error("Error al cerrar sesión", err);
        }
    };

    const initials = `${authUser?.first_name?.[0] ?? ""}${authUser?.last_name?.[0] ?? ""}`.toUpperCase();

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setShowMenu((s) => !s)}
                aria-haspopup="menu"
                aria-expanded={showMenu}
                aria-label={`Menú de ${authUser?.first_name ?? "usuario"}`}
                className="relative p-1 rounded-full text-white
                           hover:bg-white/10 active:bg-white/15
                           focus:outline-none focus-visible:ring-2
                           focus-visible:ring-lightRed focus-visible:ring-offset-2
                           focus-visible:ring-offset-cBlack
                           transition-all duration-200 min-h-11 min-w-11
                           flex items-center justify-center"
            >
                {initials ? (
                    <span className="w-9 h-9 rounded-full bg-lightRed text-white
                                     font-montserrat font-bold text-sm
                                     flex items-center justify-center
                                     ring-2 ring-white/20">
                        {initials}
                    </span>
                ) : (
                    <PiUser className="text-3xl" aria-hidden="true" />
                )}
            </button>

            {showMenu && (
                <div
                    ref={menuRef}
                    role="menu"
                    aria-label="Menú de usuario"
                    className="absolute top-full right-0 mt-3 w-60 font-roboto
                               bg-white rounded-2xl shadow-xl ring-1 ring-black/5
                               z-50 overflow-hidden
                               animate-in fade-in slide-in-from-top-2 duration-150"
                >
                    {/* Flecha */}
                    <div
                        aria-hidden="true"
                        className="absolute -top-1.5 right-5 w-3 h-3 bg-white
                                   rotate-45 ring-1 ring-black/5"
                    />

                    {/* Cabecera del usuario */}
                    <div className="relative px-4 pt-5 pb-4 bg-gradient-to-br
                                    from-gray-50 to-white border-b border-black">
                        <div className="flex items-center gap-3">
                            <span className="w-11 h-11 shrink-0 rounded-full bg-lightRed
                                             font-montserrat text-white font-bold
                                             flex items-center justify-center">
                                {initials || <PiUser className="text-xl" />}
                            </span>
                            <div className="min-w-0 text-left text-black">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {authUser.first_name} {authUser.last_name}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {authUser.role}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Acciones - Log out */}
                    <button
                        role="menuitem"
                        onClick={handleLogout}
                        className="w-full px-4 py-3 flex items-center gap-2.5
                                   text-sm font-medium text-black
                                   hover:bg-lightRed hover:text-white
                                   focus:outline-none focus:bg-lightRed focus:text-white
                                   transition-colors duration-150"
                    >
                        <PiSignOut className="text-lg" aria-hidden="true" />
                        Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    );
};
