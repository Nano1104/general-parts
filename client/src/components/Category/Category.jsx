import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
//icons
import { FaArrowAltCircleUp } from "react-icons/fa";    //flecha arriba
import { FaArrowAltCircleRight } from "react-icons/fa";   //flecha mirando derecha

/* import { IoIosArrowUp } from "react-icons/io";    //flecha arriba
import { FaArrowAltCircleRight } from "react-icons/io";   //flecha mirando derecha */

import 'animate.css';

export const Category = ({
  category,
  isActive,
  onClick,
  categoryData
}) => {
  const [activeMotorSubCategory, setActiveMotorSubCategory] = useState(null);
  const MOTOR_GROUPS = {
    engranaje: [149, 147, 146, 151, 140, 139, 141, 142, 143, 144, 145, 150, 148],
    bulones: [101, 102, 103]
  };

  const handleCategoryClick = (e) => {
    e.stopPropagation();
    onClick();
    if (isActive) setActiveMotorSubCategory(null); // Reset subcategorías al cerrar
  };

  const handleMotorSubCategoryClick = (group, e) => {
    e.stopPropagation();
    setActiveMotorSubCategory(activeMotorSubCategory === group ? null : group);
  };

  return (
    <div className="text-xs 2xl:text-sm font-montserrat">
      <div className="flex items-center gap-1 relative">
        <div className="flex w-32 justify-between items-center">
          <Link
            id={`category-${category}-link`}
            className={`category-link gap-1 text-black mb-1 uppercase ${isActive ? "font-bold" : ""}`}
            to={`/productos/${category}`}
            onClick={(e) => e.stopPropagation()}
          >
            {category}
          </Link>
          {!isActive
            ? <FaArrowAltCircleUp onClick={handleCategoryClick} className="text-base mb-1 cursor-pointer" />
            : <FaArrowAltCircleRight onClick={handleCategoryClick} className="text-base mb-1 cursor-pointer" />
          }
        </div>

        {/* SUBRUBROS */}
        {isActive && (      //CASO PARA RUBROS DE MOTOR: BULONES/TORNILLOS Y ENGRANAJE
          category === "MOTOR" ? (
            <div
              className="absolute z-20 top-0 left-full py-3 bg-gray border w-40 flex flex-col gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Grupo ENGRANAJE */}
              <div className="flex items-center justify-between px-4">
                <Link
                  to={`/productos/${category}/engranaje`}
                  className="text-black hover:font-bold transition ease-in duration-300 uppercase"
                >
                  ENGRANAJE
                </Link>
                <FaArrowAltCircleUp
                  onClick={(e) => handleMotorSubCategoryClick("engranaje", e)}
                  className={`text-base cursor-pointer ${activeMotorSubCategory === "engranaje" ? 'rotate-90' : ''
                    }`}
                />
              </div>

              {activeMotorSubCategory === "engranaje" && (
                <div className="absolute left-full top-0 bg-gray border w-72 py-3 ml-1">
                  {categoryData.subrubros
                    .filter(sub => MOTOR_GROUPS.engranaje.includes(sub[1]))
                    .map((sub, index) => (
                      <Link
                        key={`engranaje-${sub[1]}-${index}`}
                        to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                        className="text-black block px-4 py-1 hover:font-bold transition ease-in"
                      >
                        {sub[0]}
                      </Link>
                    ))
                  }
                </div>
              )}

              {/* Grupo BULONES/TORNILLOS */}
              <div className="flex items-center justify-between px-4">
                <Link
                  to={`/productos/${category}/bulones`}
                  className="text-black hover:font-bold transition ease-in duration-300 uppercase"
                >
                  BULONES
                </Link>
                <FaArrowAltCircleUp
                  onClick={(e) => handleMotorSubCategoryClick("bulones", e)}
                  className={`text-base cursor-pointer ${activeMotorSubCategory === "bulones" ? 'rotate-90' : ''
                    }`}
                />
              </div>

              {activeMotorSubCategory === "bulones" && (
                <div className="absolute left-full top-0 bg-gray border w-72 py-3 ml-1">
                  {categoryData.subrubros
                    .filter(sub => MOTOR_GROUPS.bulones.includes(sub[1]))
                    .map((sub, index) => (
                      <Link
                        key={`bulones-${sub[1]}-${index}`}
                        to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                        className="text-black block px-4 py-1 hover:font-bold transition ease-in"
                      >
                        {sub[0]}
                      </Link>
                    ))
                  }
                </div>
              )}
            </div>
          ) : (
            // Renderizado normal para otros rubros
            <div
              className="absolute z-20 top-0 left-full bg-gray py-4 border w-72 flex flex-col gap-3 justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {categoryData.subrubros.map((sub, index) => (
                <Link
                  key={`${sub[1]}-${index}`}
                  to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                  className="text-black block px-4 hover:font-bold transition ease-in"
                >
                  {sub[0]}
                </Link>
              ))}
            </div>
          )
        )}
      </div>
      {isActive && <hr />}
    </div>
  );
};


