import { Link } from "react-router-dom";
import { useRef, useCallback, useEffect } from "react";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { BsSearch } from "react-icons/bs";
import { IoCartOutline, IoCloseOutline } from "react-icons/io5";
import { UserIcon } from "../UserIcon/UserIcon.jsx";

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

    useEffect(() => {
        if (inputRef.current && searchValue === "") {
            inputRef.current.value = "";
        }
    }, [searchValue]);

    const debouncedSearch = useDebounce((value) => {
        setSearchValue(value.trim());
    }, 350);

    const handleChange = (e) => debouncedSearch(e.target.value);

    const handleClear = () => {
        if (inputRef.current) {
            inputRef.current.value = "";
            inputRef.current.focus();
        }
        setSearchValue("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSearchValue(inputRef.current?.value.trim() || "");
    };

    return (
        <header
            role="banner"
            className="sticky top-0 z-40 bg-cBlack/95 backdrop-blur-md
                       border-b border-white/5 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.4)]"
        >
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2
                           focus:z-50 focus:px-3 focus:py-2 focus:bg-lightRed focus:text-white
                           focus:rounded-md focus:font-semibold"
            >
                Saltar al contenido
            </a>

            <nav
                aria-label="Navegación principal"
                className="max-w-screen-2xl mx-auto px-4 md:px-6 xl:px-10 py-3
                           flex flex-wrap md:flex-nowrap items-center gap-x-6 gap-y-3"
            >
                {/* LOGO */}
                <Link
                    to="/"
                    translate="no"
                    aria-label="SW Autoparts - Ir al inicio"
                    className="shrink-0 font-roboto text-2xl md:text-3xl xl:text-4xl order-1
                               rounded-md focus:outline-none focus-visible:ring-2
                               focus-visible:ring-lightRed focus-visible:ring-offset-2
                               focus-visible:ring-offset-cBlack transition-transform
                               hover:scale-[1.02] active:scale-100"
                >
                    <span className="font-extrabold text-lightRed tracking-tighter">SW</span>
                    <span className="font-bold text-white tracking-tight">Autoparts</span>
                </Link>

                {/* ACCIONES DE USUARIO */}
                <div className="flex items-center gap-1 sm:gap-2 ml-auto md:ml-0
                                order-2 md:order-3 shrink-0">
                    {authUser ? (
                        <>
                            <UserIcon />
                            {authUser.role !== "admin" && (
                                <Link
                                    to="/cart-v"
                                    aria-label="Ver carrito de compras"
                                    className="relative p-2.5 rounded-xl text-white
                                               hover:bg-white/10 active:bg-white/15
                                               focus:outline-none focus-visible:ring-2
                                               focus-visible:ring-lightRed focus-visible:ring-offset-2
                                               focus-visible:ring-offset-cBlack
                                               transition-all duration-200 min-h-11 min-w-11
                                               flex items-center justify-center"
                                >
                                    <IoCartOutline className="text-2xl" aria-hidden="true" />
                                </Link>
                            )}
                        </>
                    ) : (
                        <Link
                            to="/authPage/login"
                            className="text-sm relative btn-logs font-montserrat font-bold
                                       focus:outline-none focus-visible:ring-2
                                       focus-visible:ring-lightRed focus-visible:ring-offset-2
                                       focus-visible:ring-offset-cBlack rounded-md"
                        >
                            Iniciar Sesión<div></div>
                        </Link>
                    )}
                </div>

                {/* ─── BARRA DE BÚSQUEDA ────────────────────────────────────────────
                Cambios respecto al original:
                · font-roboto → font-montserrat (consistencia tipográfica con el sistema)
                · rounded-xl  → sin border-radius (lenguaje visual sharp/industrial)
                · ring system → border system (más controlado, sin glow exterior)
                · shadow-sm / shadow-lg eliminados (reemplazados por cambio de borde)
                · Separador vertical decorativo antes del botón (divide input de acción)
                · Botón: uppercase + tracking-wide, igual que filter bar y nav
                · Icon: tamaño reducido y tratamiento de color más sutil
                Lógica: IDÉNTICA. handleSubmit, handleChange, handleClear, inputRef, searchValue
                intactos.
            ─────────────────────────────────────────────────────────────────── */}
                <form
                    role="search"
                    onSubmit={handleSubmit}
                    aria-label="Buscar productos"
                    className="w-full md:flex-1 order-3 md:order-2
                        font-montserrat md:max-w-2xl md:mx-auto"
                >
                    <label htmlFor="product-search" className="sr-only">
                        Buscar producto, código o marca
                    </label>

                    <div
                        className="group relative flex items-stretch bg-white
                    focus-within:border-zinc-800 rounded-md
                   transition-colors duration-200 overflow-hidden"
                    >
                        {/* Ícono — se oscurece junto con el borde al enfocar */}
                        <span
                            aria-hidden="true"
                            className="pl-4 pr-1 flex items-center text-zinc-300
                       group-focus-within:text-zinc-500
                       transition-colors duration-200 flex-shrink-0"
                        >
                            <BsSearch size={12} />
                        </span>

                        <input
                            id="product-search"
                            ref={inputRef}
                            type="search"
                            placeholder="Producto, código, marca..."
                            defaultValue={searchValue}
                            autoComplete="off"
                            enterKeyHint="search"
                            className="flex-1 min-w-0 h-11 px-2
                                text-[13px] text-zinc-800 tracking-wide
                                bg-transparent
                                placeholder:text-zinc-400 placeholder:text-[12px] placeholder:tracking-normal
                                focus:outline-none"
                            onChange={handleChange}
                        />

                        {/* Botón limpiar — solo visible cuando hay valor */}
                        {/* {searchValue && (
                            <button
                                onClick={handleClear}
                                type="button"
                                aria-label="Limpiar búsqueda"
                                className="px-2 text-zinc-300 hover:text-zinc-600
                           focus:outline-none focus-visible:text-lightRed
                           transition-colors duration-200 flex-shrink-0"
                            >
                                <IoCloseOutline size={16} aria-hidden="true" />
                            </button>
                        )} */}
                    </div>
                </form>
            </nav>
        </header>
    );
};
