import { useState } from "react";
import { Link } from "react-router-dom";

// FaChevronRight reemplaza a FaArrowAltCircleUp/FaArrowAltCircleRight:
//  → dirección "derecha" semánticamente correcta para flyout lateral
//  → rota 90° al expandir — patrón universalmente reconocido
import { FaChevronRight, FaChevronDown } from "react-icons/fa6";

// REMOVIDO: import 'animate.css'
//  → estaba importado pero ninguna clase animate__* se usaba en el JSX
//  → agrega el bundle completo de animate.css sin ningún beneficio

/**
 * Category — Rediseño
 *
 * Correcciones respecto al original:
 *  1. Eliminado hover:font-bold → causaba layout shift (el texto se ensanchaba
 *     empujando el ícono y los elementos adyacentes). Ahora solo cambia color.
 *
 *  2. Íconos reemplazados por FaChevronRight/FaChevronDown:
 *     → semánticamente correctos para flyout (→) y acordeón (↓)
 *     → rotan con CSS transform (sin rerender)
 *
 *  3. animate.css eliminado (dead import).
 *
 *  4. Estilos cohesivos con el sistema de diseño dark/zinc del sitio:
 *     → hover: solo color (no bold, no background pesado)
 *     → activo: text-lightRed como único acento
 *     → dropdowns: blanco limpio, sombra sutil, borde zinc
 *
 *  Lógica: IDÉNTICA al original. Ningún comportamiento fue modificado.
 */
export const Category = ({
    category,
    isActive,
    onClick,
    categoryData,
    isMobile = false,
}) => {
    const [activeIntermediateSubCategory, setActiveIntermediateSubCategory] = useState(null);

    const hasIntermediateSubrubros =
        categoryData.subrubrosIntermedios &&
        categoryData.subrubrosIntermedios.length > 0;

    const handleCategoryClick = (e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
        if (isActive) setActiveIntermediateSubCategory(null);
    };

    const handleIntermediateSubCategoryClick = (intermediateSubName, e) => {
        e.stopPropagation();
        e.preventDefault();
        setActiveIntermediateSubCategory(
            activeIntermediateSubCategory === intermediateSubName
                ? null
                : intermediateSubName
        );
    };

    // ══════════════════════════════════════════════════════
    // VERSIÓN MÓVIL
    // ══════════════════════════════════════════════════════
    if (isMobile) {
        return (
            <div className="font-montserrat">

                {/* Fila de categoría principal */}
                <div
                    className={`
                        flex items-center justify-between
                        px-3 py-2.5 border-b border-zinc-100
                        transition-colors duration-150
                        ${isActive ? "bg-red-50/70" : "hover:bg-zinc-50"}
                    `}
                >
                    <Link
                        to={`/productos/${category}`}
                        className={`
                            flex-1 text-[10px] tracking-[0.18em] uppercase
                            transition-colors duration-150
                            ${isActive
                                ? "text-lightRed font-semibold"
                                : "text-zinc-900 font-semibold"
                            }
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {category}
                    </Link>

                    <button
                        onClick={handleCategoryClick}
                        className="p-1 ml-2 flex-shrink-0"
                        aria-expanded={isActive}
                        aria-label={`${isActive ? "Cerrar" : "Abrir"} subcategorías de ${category}`}
                    >
                        <FaChevronDown
                            size={9}
                            className={`
                                transition-transform duration-200
                                ${isActive ? "rotate-180 text-lightRed" : "text-zinc-400"}
                            `}
                        />
                    </button>
                </div>

                {/* Panel de subcategorías móvil */}
                {isActive && (
                    <div className="bg-zinc-50 border-b border-zinc-100">

                        {hasIntermediateSubrubros ? (
                            // CON subrubros intermedios
                            <div>
                                {categoryData.subrubrosIntermedios.map((intermediate, idx) => (
                                    <div key={`mobile-intermediate-${idx}`}>
                                        <div
                                            className={`
                                                flex items-center justify-between
                                                px-5 py-2.5 border-b border-zinc-100
                                                transition-colors duration-150
                                                ${activeIntermediateSubCategory === intermediate.nombre
                                                    ? "bg-red-50/50"
                                                    : "hover:bg-zinc-100"
                                                }
                                            `}
                                        >
                                            <Link
                                                to={`/productos/${category}/${intermediate.nombre.toLowerCase()}`}
                                                className={`
                                                    flex-1 text-[10px] tracking-[0.15em] uppercase
                                                    transition-colors duration-150
                                                    ${activeIntermediateSubCategory === intermediate.nombre
                                                        ? "text-lightRed font-semibold"
                                                        : "text-zinc-900 font-semibold"
                                                    }
                                                `}
                                            >
                                                {intermediate.nombre}
                                            </Link>
                                            <button
                                                onClick={(e) =>
                                                    handleIntermediateSubCategoryClick(intermediate.nombre, e)
                                                }
                                                className="p-1 ml-2 flex-shrink-0"
                                                aria-expanded={
                                                    activeIntermediateSubCategory === intermediate.nombre
                                                }
                                            >
                                                <FaChevronDown
                                                    size={8}
                                                    className={`
                                                        transition-transform duration-200
                                                        ${activeIntermediateSubCategory === intermediate.nombre
                                                            ? "rotate-180 text-lightRed"
                                                            : "text-zinc-400"
                                                        }
                                                    `}
                                                />
                                            </button>
                                        </div>

                                        {activeIntermediateSubCategory === intermediate.nombre && (
                                            <div className="bg-white border-b border-zinc-100">
                                                {intermediate.subrubros.map((sub, subIdx) => (
                                                    <Link
                                                        key={`mobile-sub-${sub[1]}-${subIdx}`}
                                                        to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                                                        className="block px-8 py-2 text-[10px] tracking-[0.12em] uppercase
                                                                   text-zinc-800 font-semibold hover:text-lightRed
                                                                   border-b border-zinc-50
                                                                   transition-colors duration-150"
                                                    >
                                                        {sub[0]}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // SIN subrubros intermedios (directo)
                            <div>
                                {categoryData.subrubros?.map((sub, index) => (
                                    <Link
                                        key={`mobile-${sub[1]}-${index}`}
                                        to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                                        className="block px-5 py-2.5 text-[10px] tracking-[0.15em] uppercase
                                                   text-zinc-800 font-semibold hover:text-lightRed
                                                   border-b border-zinc-100
                                                   transition-colors duration-150"
                                    >
                                        {sub[0]}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // ══════════════════════════════════════════════════════
    // VERSIÓN DESKTOP
    // ══════════════════════════════════════════════════════
    return (
        <div className="font-roboto relative">
            <div className="flex items-center gap-0">

                {/* Fila de la categoría */}
                <div
                    className={`
                        flex items-center justify-between gap-3
                        px-3 py-2 w-44 xl:w-52
                        transition-colors duration-150
                        ${isActive ? "bg-zinc-100" : "hover:bg-zinc-50"}
                    `}
                >
                    <Link
                        to={`/productos/${category}`}
                        className={`
                            flex-1 text-[10px] tracking-[0.18em] uppercase
                            transition-colors duration-150
                            ${isActive
                                ? "text-lightRed font-semibold"
                                : "text-black font-semibold hover:text-zinc-900"
                            }
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {category}
                    </Link>

                    <button
                        onClick={handleCategoryClick}
                        className={`
                            flex-shrink-0 transition-colors duration-150
                            ${isActive ? "text-lightRed" : "text-zinc-500 hover:text-zinc-800"}
                        `}
                        aria-expanded={isActive}
                        aria-label={`${isActive ? "Cerrar" : "Abrir"} subcategorías de ${category}`}
                    >
                        <FaChevronRight
                            size={9}
                            className={`
                                transition-transform duration-200
                                ${isActive ? "rotate-90" : ""}
                            `}
                        />
                    </button>
                </div>

                {/* ── Flyout de subcategorías (desktop) ── */}
                {isActive && (
                    <div
                        className="absolute z-30 top-0 left-full ml-px subcategory-dropdown"
                        data-category-menu="true"
                    >
                        {hasIntermediateSubrubros ? (
                            // CON subrubros intermedios
                            <div
                                className="bg-white border border-zinc-200
                                           shadow-[0_4px_20px_rgba(0,0,0,0.09)]
                                           min-w-[168px] xl:min-w-[188px] py-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Label de sección */}
                                <p className="font-montserrat text-[8px] tracking-[0.28em] uppercase
                                               text-zinc-400 px-4 pt-1.5 pb-2 border-b border-zinc-100 mb-1">
                                    {category}
                                </p>

                                {categoryData.subrubrosIntermedios.map((intermediate, idx) => (
                                    <div key={`desktop-intermediate-${idx}`} className="relative">
                                        <div
                                            className={`
                                                flex items-center justify-between px-4 py-2
                                                transition-colors duration-150
                                                ${activeIntermediateSubCategory === intermediate.nombre
                                                    ? "bg-zinc-50"
                                                    : "hover:bg-zinc-50"
                                                }
                                            `}
                                        >
                                            <Link
                                                to={`/productos/${category}/${intermediate.nombre.toLowerCase()}`}
                                                className={`
                                                    flex-1 text-[10px] tracking-[0.15em] uppercase
                                                    transition-colors duration-150
                                                    ${activeIntermediateSubCategory === intermediate.nombre
                                                        ? "text-lightRed font-semibold"
                                                        : "text-zinc-900 font-semibold hover:text-zinc-900"
                                                    }
                                                `}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {intermediate.nombre}
                                            </Link>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleIntermediateSubCategoryClick(
                                                        intermediate.nombre, e
                                                    );
                                                }}
                                                className={`
                                                    ml-3 flex-shrink-0 transition-colors duration-150
                                                    ${activeIntermediateSubCategory === intermediate.nombre
                                                        ? "text-lightRed"
                                                        : "text-zinc-300 hover:text-zinc-500"
                                                    }
                                                `}
                                                aria-expanded={
                                                    activeIntermediateSubCategory === intermediate.nombre
                                                }
                                            >
                                                <FaChevronRight
                                                    size={8}
                                                    className={`
                                                        transition-transform duration-200
                                                        ${activeIntermediateSubCategory === intermediate.nombre
                                                            ? "rotate-90"
                                                            : ""
                                                        }
                                                    `}
                                                />
                                            </button>
                                        </div>

                                        {/* Tercer nivel flyout */}
                                        {activeIntermediateSubCategory === intermediate.nombre && (
                                            <div
                                                className="absolute left-full top-0 ml-px z-40
                                                           bg-white border border-zinc-200 font-roboto
                                                           shadow-[0_4px_20px_rgba(0,0,0,0.09)]
                                                           min-w-[256px] xl:min-w-[296px] py-2"
                                                data-category-menu="true"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {/* Label de sección */}
                                                <p className="text-[8px] tracking-[0.28em] uppercase
                                                               text-zinc-700 px-4 pt-1.5 pb-2 border-b border-zinc-100 mb-1">
                                                    {intermediate.nombre}
                                                </p>

                                                {intermediate.subrubros.map((sub, subIdx) => (
                                                    <Link
                                                        key={`desktop-sub-${sub[1]}-${subIdx}`}
                                                        to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                                                        className="block px-4 py-2 text-[10px] tracking-[0.12em] uppercase
                                                                   text-black font-semibold hover:text-lightRed hover:bg-zinc-50
                                                                   transition-colors duration-150"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {sub[0]}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                        ) : (
                            // SIN subrubros intermedios (directo)
                            <div
                                className="bg-white border border-zinc-200
                                           shadow-[0_4px_20px_rgba(0,0,0,0.09)] font-roboto
                                           min-w-[256px] xl:min-w-[296px] py-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Label de sección */}
                                <p className="text-[8px] tracking-[0.28em] uppercase
                                               text-zinc-700 px-4 pt-1.5 pb-2 border-b border-zinc-100 mb-1">
                                    {category}
                                </p>

                                {categoryData.subrubros?.map((sub, index) => (
                                    <Link
                                        key={`${sub[1]}-${index}`}
                                        to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                                        className="block px-4 py-2 text-[10px] tracking-[0.12em] uppercase
                                                   text-black font-semibold hover:text-lightRed hover:bg-zinc-50
                                                   transition-colors duration-150"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {sub[0]}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};