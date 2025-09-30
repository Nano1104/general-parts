import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { API_URL } from "../../utils/api_url.js"
import { useAuthContext } from "../../context/AuthContext.jsx";
//components
import { Category } from "../Category/Category.jsx";
import { Link } from "react-router-dom";

//icons
import { HiOutlineBars3 } from "react-icons/hi2";
import { FaChevronDown } from "react-icons/fa6";

// InventoryList Component - Totalmente Responsivo con lógica completa
export const InventaryList = ({ stateNews }) => {
    const { setShowNews } = stateNews;
    const [categories, setCategories] = useState([]);
    const { isAdmin } = useAuthContext();
    const menuRef = useRef(null);

    // Estados separados
    const [isRubrosOpen, setIsRubrosOpen] = useState(false); // Para el menú principal
    const [activeSubCategory, setActiveSubCategory] = useState(null); // Para subcategorías
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Para móvil

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/products/rubro/get-categories-and-subcategories`);
                setCategories(response.data.categories);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategories();

        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                // Solo cerrar si realmente es un click fuera del menú completo
                // y no un click en elementos internos del menú
                const isClickInsideDropdown = event.target.closest('.category-dropdown') ||
                    event.target.closest('.subcategory-dropdown') ||
                    event.target.closest('[data-category-menu]');

                if (!isClickInsideDropdown) {
                    setIsRubrosOpen(false);
                    setActiveSubCategory(null);
                    setIsMobileMenuOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRubrosClick = () => {
        setShowNews(false);
        setIsRubrosOpen(!isRubrosOpen);
        if (!isRubrosOpen) setActiveSubCategory(null); // Reset al abrir
    };

    const handleDestacadoClick = () => {
        setShowNews(true);
        setIsRubrosOpen(false);
        setActiveSubCategory(null);
        setIsMobileMenuOpen(false); // Cerrar menú móvil también
    };

    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        if (isRubrosOpen) setIsRubrosOpen(false); // Cerrar rubros si están abiertos
    };

    return (
        <>
            {/* NAVEGACIÓN DESKTOP */}
            <nav className="hidden lg:flex bg-deepGray h-8 relative px-4 xl:px-7 text-xs xl:text-sm">
                <div ref={menuRef} className="flex">
                    <button
                        className="flex items-center italic px-3 xl:px-4 h-full bg-black text-white uppercase font-montserrat font-bold tracking-tight cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={handleRubrosClick}
                        aria-expanded={isRubrosOpen}
                        aria-label="Mostrar rubros"
                    >
                        RUBROS
                    </button>

                    <button
                        className="flex items-center italic ml-2 xl:ml-4 px-3 xl:px-4 h-full bg-lightRed text-white uppercase font-montserrat font-bold tracking-tight cursor-pointer hover:bg-red-600 transition-colors duration-200"
                        onClick={handleDestacadoClick}
                        aria-label="Ver productos destacados"
                    >
                        DESTACADO
                    </button>

                    {isAdmin && (
                        <Link
                            to="/"
                            className="flex items-center italic ml-2 xl:ml-4 px-3 xl:px-4 h-full bg-black text-white uppercase font-montserrat font-bold tracking-tight hover:bg-gray-100 transition-colors duration-200"
                            aria-label="Volver al inicio"
                        >
                            VOLVER A INICIO
                        </Link>
                    )}

                    {/* Dropdown de categorías para desktop */}
                    {isRubrosOpen && (
                        <div
                            className="absolute top-8 left-0 z-50 bg-gray border-r-[1px] border-b-[1px] shadow-lg rounded-b-md max-h-96 category-dropdown"
                            data-category-menu="true"
                        >
                            <div className="px-6 xl:px-10 py-4">
                                <ul className="flex flex-col gap-2">
                                    {categories.map((category, index) => (
                                        <Category
                                            key={`category-${category.rubro}-${index}`}
                                            category={category.rubro}
                                            isActive={activeSubCategory === category.rubro}
                                            onClick={() => setActiveSubCategory(
                                                activeSubCategory === category.rubro ? null : category.rubro
                                            )}
                                            categoryData={category}
                                            isMobile={false}
                                        />
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* NAVEGACIÓN MÓVIL */}
            <nav className="lg:hidden bg-deepGray relative" ref={menuRef}>
                {/* Header móvil */}
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={handleMobileMenuToggle}
                        className="flex items-center gap-2 text-white font-montserrat font-bold text-sm uppercase"
                        aria-expanded={isMobileMenuOpen}
                        aria-label="Abrir menú de navegación"
                    >
                        <HiOutlineBars3 className="text-lg" />
                        MENÚ
                    </button>

                    <button
                        className="px-4 py-2 bg-lightRed text-white text-xs font-montserrat font-bold uppercase rounded hover:bg-red-600 transition-colors duration-200"
                        onClick={handleDestacadoClick}
                        aria-label="Ver productos destacados"
                    >
                        DESTACADO
                    </button>
                </div>

                {/* Menú móvil expandible */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 right-0 z-50 bg-white border-t border-gray-300 shadow-lg max-h-[70vh] overflow-y-auto">
                        <div className="p-4">
                            {/* Botón de rubros para móvil */}
                            <button
                                onClick={handleRubrosClick}
                                className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 rounded-lg mb-3 transition-colors duration-200"
                                aria-expanded={isRubrosOpen}
                            >
                                <span className="font-montserrat font-bold uppercase text-sm">Rubros</span>
                                <FaChevronDown className={`transform transition-transform duration-200 ${isRubrosOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Lista de categorías para móvil */}
                            {isRubrosOpen && (
                                <div className="space-y-2 pl-4">
                                    {categories.map((category, index) => (
                                        <Category
                                            key={`mobile-category-${category.rubro}-${index}`}
                                            category={category.rubro}
                                            isActive={activeSubCategory === category.rubro}
                                            onClick={() => setActiveSubCategory(
                                                activeSubCategory === category.rubro ? null : category.rubro
                                            )}
                                            categoryData={category}
                                            isMobile={true}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Link adicional para admin */}
                            {isAdmin && (
                                <Link
                                    to="/"
                                    className="block w-full p-3 bg-gray-100 hover:bg-gray-200 rounded-lg mt-3 font-montserrat font-bold uppercase text-sm text-center transition-colors duration-200"
                                >
                                    VOLVER A INICIO
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
};







