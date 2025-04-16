import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowUp } from "react-icons/io"; //flecha arriba
import { IoIosArrowForward } from "react-icons/io"; //flecha mirando derecha

import 'animate.css';

export const Category = ({category, activeCategory, setActiveCategory, activeSubCategory, setActiveSubCategory, categoriesAndSubCategories}) => {
    const [categoryData, setCategoryData] = useState(null)
    const [subCategories, setSubCategories] = useState([]);
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

    useEffect(() => {
        const categoryFound = categoriesAndSubCategories.find(elem => elem.description === category)
        if (categoryFound) {
            setCategoryData(categoryFound)
            setSubCategories(categoryFound.subCategories)
        }

    }, [category, categoriesAndSubCategories])

    return(
        <>
        <div className="text-xs 2xl:text-sm font-montserrat">
            <div className="flex items-center gap-1 relative">
                <div className="flex w-32 justify-between items-center">            {/*RENDERIZA UN PARA UN RUBRO */}
                    <Link
                        id={`category-${category}-link`}
                        className={`category-link gap-1 text-black text-md mb-1 uppercase`}
                        to={`/productos/${category}`}
                    >
                        {category}
                    </Link>
                    { activeCategory != category ? <IoIosArrowUp onClick={() => showSubCategories(category)} className="text-base mb-1 cursor-pointer" /> : <IoIosArrowForward onClick={() => showSubCategories(null)} className="text-base mb-1 cursor-pointer" /> }
                </div>



                { activeCategory == category && (                   //categorias que tengan submenu de categorias
                    categoryData && categoryData.submenu ? (        //EN CASO DE QUE EL SUBRUBRO DEL RUBRO PADRE CONTENGA MAS SUBCATEGORIAS DENTRO
                        <div className="absolute z-20 top-0 left-full py-3 bg-gray border w-40">
                        {
                            subCategories.map((subCategory, index) => (
                                <div key={`sub-${subCategory}-${index}`} className="flex items-center relative">
                                    <Link
                                        to={`/productos/${category}/${encodeURIComponent(subCategory.description)}`}
                                        className="text-cBlack text-sm block px-4 transition ease-in duration-300 uppercase">
                                        {subCategory.description}
                                    </Link>
                                    { activeSubCategory != subCategory.description              // CAMBIA LA FLECHA DE CUANDO SE ABRE O CIERRA UN SUBRUBRO
                                        ? <IoIosArrowUp onClick={() => showSubCategoriesSubmenu(subCategory.description)} className="text-base mb-1 cursor-pointer" />
                                        : <IoIosArrowForward  onClick={() => showSubCategoriesSubmenu(null)} className="text-base mb-1 cursor-pointer" /> }

                                    { activeSubCategory == subCategory.description && (         //RENDERIZA LAS SUBCATEROGIRAS DEL SUBRUBRO CORRESPONDIENTE
                                        <div key={`subcategory-${subCategory.description}`} className="absolute z-20 top-0 left-full bg-gray py-4 border w-72 flex flex-col gap-3 justify-center">
                                            {
                                                getSubCategories(subCategory.description).map((sub, index) => (
                                                    <Link
                                                        key={`${sub.idSubcategory}-${index}`} // Agrega una clave única para cada subcategoría
                                                        to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(subCategory.description)}/${encodeURIComponent(sub)}`}
                                                        className="text-cBlack text-sm block px-4 hover:font-bold transition ease-in"
                                                    >
                                                        {sub}
                                                    </Link>
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                            ))
                        }
                        </div>
                    ) : (
                        <div className="absolute z-20 top-0 left-full bg-gray py-4 border w-72 flex flex-col gap-3 justify-center">
                        {
                            getSubCategories(activeSubCategory).map((sub, idx) => (
                                <Link
                                key={`${sub}-${idx}`}
                                to={`/productos/${encodeURIComponent(category)}/${encodeURIComponent(sub)}`}
                                className="text-cBlack text-sm block px-4 hover:font-bold transition ease-in"
                                >
                                {sub}
                                </Link>
                            ))
                        }
                        </div>
                    )
                )}
            </div>
            { activeCategory == category ? <hr/> : <></> }

        </div>
        </>
    )
}
