import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowUp } from "react-icons/io"; //flecha arriba
import { IoIosArrowForward } from "react-icons/io"; //flecha mirando derecha

import 'animate.css';

export const Category = ({category, activeCategory, setActiveCategory, activeSubCategory, setActiveSubCategory, categoryData, /* categoriesAndSubCategories */}) => {    
    const [activeMotorSubCategory, setActiveMotorSubCategory] = useState(null);
    const MOTOR_GROUPS = {
        engranaje: [149, 147, 146, 151, 140, 139, 141, 142, 143, 144, 145, 150, 148],
        bulones: [101, 102, 103]
    };

    /* const [categoryData, setCategoryData] = useState(null) */
    /* const [subCategories, setSubCategories] = useState([]); */
    /* const [showCategoriesSubmenu, setShowCategoriesSubmenu] = useState(false); */

    //renderiza las categorias del rubro principal en caso de que no haya submenu de subrubros
    const showSubCategories = (category) => category ? setActiveCategory(category) : setActiveCategory(null)

    //renderiza los subrubros del rubro principal
    const showSubCategoriesSubmenu = (subcategory) => subcategory ? setActiveSubCategory(subcategory) : setActiveSubCategory(null)

    const getSubCategories = (subcategoryName) => {             //FUNCION QUE DEVUELVE
        const categoryFound = categoriesAndSubCategories.find(cat => cat.description == category)

        if (categoryFound.submenu) {        //en caso de que la category tenga un submenu 
            const foundSubcategory = categoryFound.subCategories.find(subcategory => subcategory.description === subcategoryName);      //en este caso, habra mas de una subcategoria dentro del array de subCategories
                                                                                                                                        //por eso busca cual es el que coincide con la subcategoria pasada por parametro
            if (foundSubcategory) return [...foundSubcategory.categories]; // Devuelve un array con la subcategoría encontrada
        } else {
            return [...categoryFound.subCategories[0].categories]
        }
    
        return []; // Devuelve un array vacío si no encuentra nada
    };

    return(
        <>
        <div className="text-xs 2xl:text-sm font-montserrat">
            <div className="flex items-center gap-1 relative">
                <div className="flex w-32 justify-between items-center">  
                    <Link
                        id={`category-${category}-link`}
                        className={`category-link gap-1 text-black text-md mb-1 uppercase`}
                        to={`/productos/${category}`}
                    >
                        {category}
                    </Link>
                    {activeCategory !== category 
                        ? <IoIosArrowUp onClick={() => showSubCategories(category)} className="text-base mb-1 cursor-pointer" />
                        : <IoIosArrowForward onClick={() => showSubCategories(null)} className="text-base mb-1 cursor-pointer" />
                    }
                </div>

                {/* RENDERIZADO DE SUBRUBROS */}
                {activeCategory === category && (
                    category === "MOTOR" ? (
                        <div className="absolute z-20 top-0 left-full py-3 bg-gray border w-40 flex flex-col gap-2">
                            {/* Grupo ENGRANAJE */}
                            <div className="flex items-center justify-between px-4">
                                <Link to={`/productos/${category}/engranaje`} className="text-cBlack text-sm transition ease-in duration-300 uppercase">
                                    ENGRANAJE
                                </Link>
                                {activeMotorSubCategory === "engranaje"
                                    ? <IoIosArrowUp onClick={() => setActiveMotorSubCategory(null)} className="text-base cursor-pointer" />
                                    : <IoIosArrowForward onClick={() => setActiveMotorSubCategory("engranaje")} className="text-base cursor-pointer" />
                                }
                            </div>

                            {/* Submenu de ENGRANAJE */}
                            {activeMotorSubCategory === "engranaje" && (
                                <div className="absolute left-full top-0 bg-gray border w-72 py-3 ml-1">
                                    {categoryData.subrubros
                                        .filter(sub => MOTOR_GROUPS.engranaje.includes(sub[1]))
                                        .map((sub, index) => (
                                            <Link
                                                key={`engranaje-${sub[1]}-${index}`}
                                                to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                                                className="text-cBlack text-sm block px-4 py-1 hover:font-bold transition ease-in"
                                            >
                                                {sub[0]}
                                            </Link>
                                        ))
                                    }
                                </div>
                            )}

                            {/* Grupo BULONES/TORNILLOS */}
                            <div className="flex items-center justify-between px-4">
                                <Link to={`/productos/${category}/bulones`} className="text-cBlack text-sm transition ease-in duration-300 uppercase">
                                    BULONES
                                </Link>
                                {activeMotorSubCategory === "bulones"
                                    ? <IoIosArrowUp onClick={() => setActiveMotorSubCategory(null)} className="text-base cursor-pointer" />
                                    : <IoIosArrowForward onClick={() => setActiveMotorSubCategory("bulones")} className="text-base cursor-pointer" />
                                }
                            </div>

                            {/* Submenu de BULONES */}
                            {activeMotorSubCategory === "bulones" && (
                                <div className="absolute left-full top-0 bg-gray border w-72 py-3 ml-1">
                                    {categoryData.subrubros
                                        .filter(sub => MOTOR_GROUPS.bulones.includes(sub[1]))
                                        .map((sub, index) => (
                                            <Link
                                                key={`bulones-${sub[1]}-${index}`}
                                                to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                                                className="text-cBlack text-sm block px-4 py-1 hover:font-bold transition ease-in"
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
                        <div className="absolute z-20 top-0 left-full bg-gray py-4 border w-72 flex flex-col gap-3 justify-center">
                            {categoryData.subrubros.map((sub, index) => (
                                <Link
                                    key={`${sub[1]}-${index}`}
                                    to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub[0])}`}
                                    className="text-cBlack text-sm block px-4 hover:font-bold transition ease-in"
                                >
                                    {sub[0]}
                                </Link>
                            ))}
                        </div>
                    )
                )}
            </div>
            {activeCategory === category && <hr/>}
        </div>
        </>
    )
}


