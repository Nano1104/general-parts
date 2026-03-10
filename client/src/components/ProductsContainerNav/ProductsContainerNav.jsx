// ProductsContainerNav.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Mejoras respecto a la versión original:
// 1. Debounce de 350ms → no dispara una búsqueda por cada tecla
// 2. Botón limpiar (✕) cuando hay texto
// 3. El `searchValue` sigue viviendo en ProductosPage (no cambia el contrato)
// ─────────────────────────────────────────────────────────────────────────────

import { Link } from "react-router-dom";
import { useRef, useCallback, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { BsSearch } from "react-icons/bs";
import { IoCartOutline } from "react-icons/io5";
import { IoCloseOutline } from "react-icons/io5";
import { UserIcon } from "../UserIcon/UserIcon.jsx";

// ── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(callback, delay) {
    const timerRef = useRef(null);
    return useCallback(
        (...args) => {
            clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => callback(...args), delay);
        },
        [callback, delay]
    );
}

export const ProductsContainerNav = ({ searchValue, setSearchValue }) => {
    const { authUser } = useAuthContext();
    const inputRef = useRef(null);

    // Sincronizar el input si searchValue se limpia desde afuera
    // (ej.: cuando el usuario navega a una categoría)
    useEffect(() => {
        if (inputRef.current && searchValue === "") {
            inputRef.current.value = "";
        }
    }, [searchValue]);

    // Dispara la búsqueda con debounce (350 ms tras dejar de tipear)
    const debouncedSearch = useDebounce((value) => {
        setSearchValue(value.trim());
    }, 350);

    const handleChange = (e) => {
        debouncedSearch(e.target.value);
    };

    const handleClear = () => {
        if (inputRef.current) inputRef.current.value = "";
        setSearchValue("");
    };

    const handleKeyDown = (e) => {
        // Enter fuerza búsqueda inmediata (sin esperar debounce)
        if (e.key === "Enter") {
            setSearchValue(inputRef.current?.value.trim() || "");
        }
    };

    return (
        <nav className="p-2 bg-cBlack">
            <ul className="px-4 grid sm:grid-cols-[1fr_45%_1fr] 2xl:grid-cols-[1fr_30%_1fr]">
                {/* LOGO */}
                <Link
                    to="/"
                    translate="no"
                    className="text-3xl italic font-roboto lg:text-4xl 2xl:text-5xl 2xl:my-2 w-0"
                >
                    <span className="font-extrabold text-lightRed tracking-tighter">SW</span>
                    <span className="font-bold text-white tracking-tight">Autoparts</span>
                </Link>

                {/* ACCIONES DE USUARIO */}
                <div className="flex justify-end font-montserrat font-bold items-center sm:order-1 gap-4 mr-2 text-white">
                    {authUser ? (
                        <>
                            <UserIcon />
                            {authUser.role !== "admin" && (
                                <Link to="/cart-v" className="flex justify-center items-center">
                                    <IoCartOutline className="inline-block text-3xl" />
                                </Link>
                            )}
                        </>
                    ) : (
                        <Link
                            to="/authPage/login"
                            className="text-sm rounded-[8px] relative btn-logs"
                        >
                            Iniciar Sesión<div></div>
                        </Link>
                    )}
                </div>

                {/* BARRA DE BÚSQUEDA */}
                <div className="mt-2 flex font-roboto items-center col-span-2 sm:col-span-1 relative">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar producto, código, marca..."
                        defaultValue={searchValue}
                        className="h-[30px] rounded-tl-2xl rounded-bl-2xl rounded-tr-none rounded-br-none
                                   py-2 px-3 flex-grow basis-[80%] focus:outline-none pr-8"
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                    />

                    {/* Botón limpiar (solo visible cuando hay texto) */}
                    {searchValue && (
                        <button
                            onClick={handleClear}
                            className="absolute right-10 text-gray-400 hover:text-gray-700 transition-colors"
                            type="button"
                            aria-label="Limpiar búsqueda"
                        >
                            <IoCloseOutline className="text-xl" />
                        </button>
                    )}

                    <BsSearch
                        className="h-[30px] text-deepGray bg-white p-1 cursor-pointer
                                   rounded-tr-2xl rounded-br-2xl flex-grow basis-0"
                        onClick={() => setSearchValue(inputRef.current?.value.trim() || "")}
                    />
                </div>
            </ul>
        </nav>
    );
};