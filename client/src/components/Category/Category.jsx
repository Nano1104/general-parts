import { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowAltCircleUp, FaArrowAltCircleRight, FaChevronDown } from "react-icons/fa";
import 'animate.css';

export const Category = ({
  category,
  isActive,
  onClick,
  categoryData,
  isMobile = false
}) => {
  const [activeIntermediateSubCategory, setActiveIntermediateSubCategory] = useState(null);

  // ✨ Detectar si tiene subrubros intermedios
  const hasIntermediateSubrubros = categoryData.subrubrosIntermedios && categoryData.subrubrosIntermedios.length > 0;

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
      activeIntermediateSubCategory === intermediateSubName ? null : intermediateSubName
    );
  };

  // ============================================
  // VERSIÓN MÓVIL
  // ============================================
  if (isMobile) {
    return (
      <div className="font-montserrat">
        {/* Categoría principal */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center justify-between p-2 bg-white hover:bg-gray-50 rounded border transition-colors duration-200">
            <Link
              to={`/productos/${category}`}
              className={`flex-1 text-gray-800 text-sm uppercase ${isActive ? "font-bold" : "font-medium"}`}
              onClick={(e) => e.stopPropagation()}
            >
              {category}
            </Link>
            <button
              onClick={handleCategoryClick}
              className="p-1"
              aria-expanded={isActive}
            >
              <FaChevronDown className={`text-sm text-gray-600 transform transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Subcategorías */}
        {isActive && (
          <div className="mt-2 ml-4 space-y-2">
            {hasIntermediateSubrubros ? (
              // ✨ CON subrubros intermedios
              <div className="space-y-2">
                {categoryData.subrubrosIntermedios.map((intermediate, idx) => (
                  <div key={`mobile-intermediate-${idx}`}>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <Link
                        to={`/productos/${category}/${intermediate.nombre.toLowerCase()}`}
                        className="flex-1 text-gray-700 text-sm uppercase font-medium"
                      >
                        {intermediate.nombre}
                      </Link>
                      <button
                        onClick={(e) => handleIntermediateSubCategoryClick(intermediate.nombre, e)}
                        className="p-1"
                        aria-expanded={activeIntermediateSubCategory === intermediate.nombre}
                      >
                        <FaChevronDown className={`text-xs text-gray-500 transform transition-transform duration-200 ${activeIntermediateSubCategory === intermediate.nombre ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {activeIntermediateSubCategory === intermediate.nombre && (
                      <div className="mt-1 ml-4 space-y-1">
                        {intermediate.subrubros.map((sub, subIdx) => (
                          <Link
                            key={`mobile-sub-${sub[1]}-${subIdx}`}
                            to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                            className="block p-2 text-gray-600 text-xs hover:text-lightRed hover:bg-gray-50 rounded transition-all duration-200"
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
              // ✨ SIN subrubros intermedios (directo)
              <div className="space-y-1">
                {categoryData.subrubros?.map((sub, index) => (
                  <Link
                    key={`mobile-${sub[1]}-${index}`}
                    to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                    className="block p-2 text-gray-600 text-sm hover:text-lightRed hover:bg-gray-50 rounded transition-all duration-200"
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

  // ============================================
  // VERSIÓN DESKTOP
  // ============================================
  return (
    <div className="text-xs lg:text-sm font-montserrat">
      <div className="flex items-center gap-1 relative">
        <div className="flex w-32 xl:w-36 justify-between items-center">
          <Link
            id={`category-${category}-link`}
            className={`category-link gap-1 text-black mb-1 uppercase hover:text-deepRed hover:font-bold ${isActive ? "font-bold" : ""}`}
            to={`/productos/${category}`}
            onClick={(e) => e.stopPropagation()}
          >
            {category}
          </Link>
          <button
            onClick={handleCategoryClick}
            className="mb-1 cursor-pointer hover:text-deepRed p-1"
            aria-expanded={isActive}
          >
            {!isActive
              ? <FaArrowAltCircleUp className="text-base" />
              : <FaArrowAltCircleRight className="text-base" />
            }
          </button>
        </div>

        {/* SUBRUBROS DESKTOP */}
        {isActive && (
          <div className="absolute z-30 top-0 left-full subcategory-dropdown" data-category-menu="true">
            {hasIntermediateSubrubros ? (
              // ✨ CON subrubros intermedios
              <div
                className="py-3 bg-cWhite border border-gray-300 shadow-lg rounded w-40 xl:w-44 flex flex-col gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {categoryData.subrubrosIntermedios.map((intermediate, idx) => (
                  <div key={`desktop-intermediate-${idx}`} className="relative">
                    <div className="flex items-center justify-between px-4 hover:bg-gray-100">
                      <Link
                        to={`/productos/${category}/${intermediate.nombre.toLowerCase()}`}
                        className="flex-1 text-black hover:text-deepRed hover:font-bold uppercase py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {intermediate.nombre}
                      </Link>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleIntermediateSubCategoryClick(intermediate.nombre, e);
                        }}
                        className="text-base cursor-pointer hover:text-deepRed p-1 ml-2"
                        aria-expanded={activeIntermediateSubCategory === intermediate.nombre}
                      >
                        <FaArrowAltCircleUp className={`transform transition-transform duration-200 ${activeIntermediateSubCategory === intermediate.nombre ? 'rotate-90' : ''}`} />
                      </button>
                    </div>

                    {activeIntermediateSubCategory === intermediate.nombre && (
                      <div
                        className="absolute left-full top-0 bg-cWhite border border-gray-300 shadow-lg rounded w-72 xl:w-80 py-3 ml-1 z-40"
                        data-category-menu="true"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {intermediate.subrubros.map((sub, subIdx) => (
                          <Link
                            key={`desktop-sub-${sub[1]}-${subIdx}`}
                            to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                            className="text-black block px-4 py-2 hover:text-deepRed hover:font-bold hover:bg-gray-100"
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
              // ✨ SIN subrubros intermedios (directo)
              <div
                className="bg-cWhite py-4 border border-gray-300 shadow-lg rounded w-72 xl:w-80 flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {categoryData.subrubros?.map((sub, index) => (
                  <Link
                    key={`${sub[1]}-${index}`}
                    to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                    className="text-black block px-4 py-2 hover:text-deepRed hover:font-bold hover:bg-gray-100"
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
      {isActive && <hr className="border-gray-300" />}
    </div>
  );
};