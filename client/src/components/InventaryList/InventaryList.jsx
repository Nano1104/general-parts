import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { API_URL } from "../../utils/api_url.js";
import { useAuthContext } from "../../context/AuthContext.jsx";

// components
import { Category } from "../Category/Category.jsx";
import { Link } from "react-router-dom";

// icons
import { HiOutlineBars3 } from "react-icons/hi2";
import { FaChevronDown } from "react-icons/fa6";

/**
 * InventaryList — Rediseño
 *
 * Correcciones respecto al original:
 *  1. BUG FIX: menuRef ya no se asigna dos veces a dos nodos distintos.
 *     Ahora envuelve AMBAS navs (desktop + mobile) en un único div wrapper.
 *     Antes: el ref del mobile sobreescribía el del desktop silenciosamente.
 *
 *  2. handleClickOutside simplificado: el menuRef.current.contains() ya cubre
 *     todos los elementos del árbol (incluyendo dropdowns). Las verificaciones
 *     adicionales con .closest() eran redundantes y frágiles.
 *
 *  3. setIsRubrosOpen usa forma funcional (prev => !prev) para evitar
 *     stale closures en entornos con batching concurrente (React 18+).
 */
export const InventaryList = ({ stateNews }) => {
    const { setShowNews } = stateNews;
    const [categories, setCategories] = useState([]);
    const { isAdmin } = useAuthContext();

    // FIX: un solo ref que cubre el wrapper completo (desktop + mobile)
    const menuRef = useRef(null);

    const [isRubrosOpen, setIsRubrosOpen] = useState(false);
    const [activeSubCategory, setActiveSubCategory] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(
                    `${API_URL}/api/products/rubro/get-categories-and-subcategories`
                );
                setCategories(response.data.categories);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategories();

        // FIX: simplificado — .contains() ya cubre todo el subárbol del menú
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsRubrosOpen(false);
                setActiveSubCategory(null);
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleRubrosClick = () => {
        setShowNews(false);
        setIsRubrosOpen((prev) => {
            if (!prev) setActiveSubCategory(null); // reset al abrir
            return !prev;
        });
    };

    const handleDestacadoClick = () => {
        setShowNews(true);
        setIsRubrosOpen(false);
        setActiveSubCategory(null);
        setIsMobileMenuOpen(false);
    };

    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen((prev) => !prev);
        if (isRubrosOpen) setIsRubrosOpen(false);
    };

    return (
        // Wrapper único con el ref — cubre desktop y mobile simultáneamente
        <div ref={menuRef}>

            {/* ─── DESKTOP NAV ─────────────────────────────────────── */}
            <nav className="hidden lg:flex items-center relative
                            bg-zinc-900 border-b border-white/[0.07]
                            h-11 px-5 xl:px-8">

                {/* RUBROS */}
                <button
                    className={`
                        relative flex items-center gap-2 h-full px-5 select-none
                        font-montserrat text-[10px] tracking-[0.22em] uppercase font-medium
                        transition-colors duration-200
                        ${isRubrosOpen
                            ? "text-white"
                            : "text-white/60 hover:text-white/80"
                        }
                    `}
                    onClick={handleRubrosClick}
                    aria-expanded={isRubrosOpen}
                    aria-label="Mostrar rubros"
                >
                    Rubros
                    <FaChevronDown
                        size={8}
                        className={`
                            transition-transform duration-300
                            ${isRubrosOpen ? "rotate-180 text-lightRed" : ""}
                        `}
                    />
                    {/* Indicador activo — línea roja inferior */}
                    <span
                        className={`
                            absolute bottom-0 left-5 right-5 h-px bg-lightRed
                            transition-transform duration-200 origin-left
                            ${isRubrosOpen ? "scale-x-100" : "scale-x-0"}
                        `}
                    />
                </button>

                {/* Separador vertical */}
                <span className="w-px h-3.5 bg-white/10 mx-1 flex-shrink-0" />

                {/* DESTACADO */}
                <button
                    className="flex items-center h-full px-5 select-none
                               font-montserrat text-[10px] tracking-[0.22em] uppercase font-medium
                               text-white/60 hover:text-lightRed transition-colors duration-200"
                    onClick={handleDestacadoClick}
                    aria-label="Ver productos destacados"
                >
                    Destacado
                </button>

                {/* ADMIN — volver a inicio */}
                {isAdmin && (
                    <>
                        <span className="w-px h-3.5 bg-white/10 mx-1 flex-shrink-0" />
                        <Link
                            to="/"
                            className="flex items-center h-full px-5
                                       font-montserrat text-[10px] tracking-[0.22em] uppercase font-medium
                                       text-white/60 hover:text-white/65 transition-colors duration-200"
                            aria-label="Volver al inicio"
                        >
                            ← Inicio
                        </Link>
                    </>
                )}

                {/* ── Dropdown de categorías ── */}
                {isRubrosOpen && (
                    <div className="absolute top-full left-0 z-50 bg-white
                                    border-x border-b border-zinc-200
                                    shadow-[0_12px_32px_rgba(0,0,0,0.14)]">
                        <div className="px-5 xl:px-6 pt-4 pb-3 min-w-[200px]">
                            {/* Label de sección */}
                            <p className="font-montserrat text-[10px] tracking-[0.16em] uppercase
                                          text-black mb-3 pl-1">
                                Categorías
                            </p>

                            <ul className="flex flex-col">
                                {categories.map((category, index) => (
                                    <Category
                                        key={`category-${category.rubro}-${index}`}
                                        category={category.rubro}
                                        isActive={activeSubCategory === category.rubro}
                                        onClick={() =>
                                            setActiveSubCategory(
                                                activeSubCategory === category.rubro
                                                    ? null
                                                    : category.rubro
                                            )
                                        }
                                        categoryData={category}
                                        isMobile={false}
                                    />
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </nav>

            {/* ─── MOBILE NAV ──────────────────────────────────────── */}
            <nav className="lg:hidden bg-zinc-900 border-b border-white/[0.07] relative">

                {/* Barra superior móvil */}
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={handleMobileMenuToggle}
                        className="flex items-center gap-2.5 select-none
                                   font-montserrat text-[10px] tracking-[0.22em] uppercase font-medium
                                   text-white/50 hover:text-white/80 transition-colors duration-200"
                        aria-expanded={isMobileMenuOpen}
                        aria-label="Abrir menú de navegación"
                    >
                        <HiOutlineBars3 size={17} />
                        Menú
                        <FaChevronDown
                            size={8}
                            className={`
                                transition-transform duration-300
                                ${isMobileMenuOpen ? "rotate-180" : ""}
                            `}
                        />
                    </button>

                    <button
                        className="px-4 py-1.5 bg-lightRed text-white select-none
                                   font-montserrat text-[9px] tracking-[0.22em] uppercase font-medium
                                   hover:bg-red-600 transition-colors duration-200"
                        onClick={handleDestacadoClick}
                        aria-label="Ver productos destacados"
                    >
                        Destacado
                    </button>
                </div>

                {/* Panel expandible móvil */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 z-50
                                    bg-white border-b border-zinc-200
                                    shadow-[0_8px_24px_rgba(0,0,0,0.12)]
                                    max-h-[70vh] overflow-y-auto">
                        <div className="p-4 flex flex-col gap-2">

                            {/* Botón acordeón de Rubros */}
                            <button
                                onClick={handleRubrosClick}
                                className="w-full flex items-center justify-between px-3 py-3
                                           bg-zinc-50 hover:bg-zinc-100
                                           border border-zinc-200
                                           font-montserrat text-[10px] tracking-[0.22em] uppercase font-medium
                                           text-zinc-600 transition-colors duration-200"
                                aria-expanded={isRubrosOpen}
                            >
                                <span>Rubros</span>
                                <FaChevronDown
                                    size={9}
                                    className={`
                                        transition-transform duration-300
                                        ${isRubrosOpen ? "rotate-180 text-lightRed" : "text-zinc-400"}
                                    `}
                                />
                            </button>

                            {/* Lista de categorías móvil */}
                            {isRubrosOpen && (
                                <div className="pl-2 flex flex-col gap-0.5">
                                    {categories.map((category, index) => (
                                        <Category
                                            key={`mobile-category-${category.rubro}-${index}`}
                                            category={category.rubro}
                                            isActive={activeSubCategory === category.rubro}
                                            onClick={() =>
                                                setActiveSubCategory(
                                                    activeSubCategory === category.rubro
                                                        ? null
                                                        : category.rubro
                                                )
                                            }
                                            categoryData={category}
                                            isMobile={true}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Admin — volver al inicio */}
                            {isAdmin && (
                                <Link
                                    to="/"
                                    className="block w-full px-3 py-3 text-center
                                               bg-zinc-50 hover:bg-zinc-100
                                               border border-zinc-200
                                               font-montserrat text-[10px] tracking-[0.22em] uppercase font-medium
                                               text-zinc-500 transition-colors duration-200"
                                >
                                    ← Volver al inicio
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
};