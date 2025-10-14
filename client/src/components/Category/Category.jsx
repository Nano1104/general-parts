import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
//icons
import { FaArrowAltCircleUp } from "react-icons/fa";    //flecha arriba
import { FaArrowAltCircleRight } from "react-icons/fa";   //flecha mirando derecha
import { FaChevronDown } from "react-icons/fa6";
/* import { IoIosArrowUp } from "react-icons/io";    //flecha arriba
import { FaArrowAltCircleRight } from "react-icons/io";   //flecha mirando derecha */

import 'animate.css';

// Category Component - Totalmente Responsivo
export const Category = ({
  category,
  isActive,
  onClick,
  categoryData,
  isMobile = false
}) => {
  const [activeMotorSubCategory, setActiveMotorSubCategory] = useState(null);

  const MOTOR_GROUPS = {
    engranaje: [149, 147, 146, 151, 140, 139, 141, 142, 143, 144, 145, 150, 148],
    bulones: [101, 102, 103]
  };

  const handleCategoryClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onClick();
    if (isActive) setActiveMotorSubCategory(null); // Reset subcategorías al cerrar
  };

  const handleMotorSubCategoryClick = (group, e) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveMotorSubCategory(activeMotorSubCategory === group ? null : group);
  };

  if (isMobile) {
    return (
      <div className="font-montserrat">
        {/* Categoría principal en móvil */}
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
              aria-label={`${isActive ? 'Ocultar' : 'Mostrar'} subcategorías de ${category}`}
            >
              <FaChevronDown className={`text-sm text-gray-600 transform transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Subcategorías en móvil */}
        {isActive && (
          <div className="mt-2 ml-4 space-y-2">
            {category === "MOTOR" ? (
              <div className="space-y-2">
                {/* Grupo ENGRANAJE */}
                <div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <Link
                      to={`/productos/${category}/engranaje`}
                      className="flex-1 text-gray-700 text-sm uppercase font-medium"
                    >
                      ENGRANAJE
                    </Link>
                    <button
                      onClick={(e) => handleMotorSubCategoryClick("engranaje", e)}
                      className="p-1"
                      aria-expanded={activeMotorSubCategory === "engranaje"}
                    >
                      <FaChevronDown className={`text-xs text-gray-500 transform transition-transform duration-200 ${activeMotorSubCategory === "engranaje" ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {activeMotorSubCategory === "engranaje" && (
                    <div className="mt-1 ml-4 space-y-1">
                      {categoryData.subrubros
                        .filter(sub => MOTOR_GROUPS.engranaje.includes(sub[1]))
                        .map((sub, index) => (
                          <Link
                            key={`mobile-engranaje-${sub[1]}-${index}`}
                            to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                            className="block p-2 text-gray-600 text-xs hover:text-lightRed hover:bg-gray-50 rounded transition-all duration-200"
                          >
                            {sub[0]}
                          </Link>
                        ))
                      }
                    </div>
                  )}
                </div>

                {/* Grupo BULONES */}
                <div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <Link
                      to={`/productos/${category}/bulones`}
                      className="flex-1 text-gray-700 text-sm uppercase font-medium"
                    >
                      BULONES
                    </Link>
                    <button
                      onClick={(e) => handleMotorSubCategoryClick("bulones", e)}
                      className="p-1"
                      aria-expanded={activeMotorSubCategory === "bulones"}
                    >
                      <FaChevronDown className={`text-xs text-gray-500 transform transition-transform duration-200 ${activeMotorSubCategory === "bulones" ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {activeMotorSubCategory === "bulones" && (
                    <div className="mt-1 ml-4 space-y-1">
                      {categoryData.subrubros
                        .filter(sub => MOTOR_GROUPS.bulones.includes(sub[1]))
                        .map((sub, index) => (
                          <Link
                            key={`mobile-bulones-${sub[1]}-${index}`}
                            to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                            className="block p-2 text-gray-600 text-xs hover:text-lightRed hover:bg-gray-50 rounded transition-all duration-200"
                          >
                            {sub[0]}
                          </Link>
                        ))
                      }
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Subcategorías normales en móvil
              <div className="space-y-1">
                {categoryData.subrubros.map((sub, index) => (
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

  // Versión Desktop (mejorada con mejor manejo de eventos)
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
            aria-label={`${isActive ? 'Ocultar' : 'Mostrar'} subcategorías de ${category}`}
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
            {category === "MOTOR" ? (
              <div
                className="py-3 bg-cWhite border border-gray-300 shadow-lg rounded w-40 xl:w-44 flex flex-col gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Grupo ENGRANAJE */}
                <div className="relative">
                  <div className="flex items-center justify-between px-4 hover:bg-gray-100">
                    <Link
                      to={`/productos/${category}/engranaje`}
                      className="flex-1 text-black hover:text-deepRed hover:font-bold uppercase py-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ENGRANAJE
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMotorSubCategoryClick("engranaje", e);
                      }}
                      className="text-base cursor-pointer hover:text-deepRed p-1 ml-2"
                      aria-expanded={activeMotorSubCategory === "engranaje"}
                    >
                      <FaArrowAltCircleUp className={`transform transition-transform duration-200 ${activeMotorSubCategory === "engranaje" ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {activeMotorSubCategory === "engranaje" && (
                    <div
                      className="absolute left-full top-0 bg-cWhite border border-gray-300 shadow-lg rounded w-72 xl:w-80 py-3 ml-1 z-40"
                      data-category-menu="true"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {categoryData.subrubros
                        .filter(sub => MOTOR_GROUPS.engranaje.includes(sub[1]))
                        .map((sub, index) => (
                          <Link
                            key={`engranaje-${sub[1]}-${index}`}
                            to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                            className="text-black block px-4 py-2 hover:text-deepRed hover:font-bold hover:bg-gray-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {sub[0]}
                          </Link>
                        ))
                      }
                    </div>
                  )}
                </div>

                {/* Grupo BULONES */}
                <div className="relative">
                  <div className="flex items-center justify-between px-4 hover:bg-gray-100">
                    <Link
                      to={`/productos/${category}/bulones`}
                      className="flex-1 text-black hover:text-deepRed hover:font-bold uppercase py-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      BULONES
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleMotorSubCategoryClick("bulones", e);
                      }}
                      className="text-base cursor-pointer hover:text-deepRed p-1 ml-2"
                      aria-expanded={activeMotorSubCategory === "bulones"}
                    >
                      <FaArrowAltCircleUp className={`transform transition-transform duration-200 ${activeMotorSubCategory === "bulones" ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {activeMotorSubCategory === "bulones" && (
                    <div
                      className="absolute left-full top-0 bg-cWhite border border-gray-300 shadow-lg rounded w-72 xl:w-80 py-3 ml-1 z-40"
                      data-category-menu="true"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {categoryData.subrubros
                        .filter(sub => MOTOR_GROUPS.bulones.includes(sub[1]))
                        .map((sub, index) => (
                          <Link
                            key={`bulones-${sub[1]}-${index}`}
                            to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                            className="text-black block px-4 py-2 hover:text-deepRed hover:font-bold hover:bg-gray-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {sub[0]}
                          </Link>
                        ))
                      }
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Renderizado normal para otros rubros en desktop
              <div
                className="bg-cWhite py-4 border border-gray-300 shadow-lg rounded w-72 xl:w-80 flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {categoryData.subrubros.map((sub, index) => (
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

