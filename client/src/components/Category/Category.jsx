import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { categoriesAndSubCategories } from "../../utils/categories&SubCategories.js";

import "./category.css"
import 'animate.css';

export const Category = ({category, activeCategory, setActiveCategory, categoriesAndSubCategories}) => {
    const [subCategories, setSubCategories] = useState([]);
    const [isMobile, setIsMobile] = useState(false);

    const showSubCategories = () => setActiveCategory(category)
    const hideSubCategories = () => setActiveCategory(null);
    const handleClick = () => setActiveCategory(category)

    useEffect(() => {
        const categoryFound = categoriesAndSubCategories.find(elem => elem.category === category);
        if(categoryFound) {
            setSubCategories(categoryFound.subCategories)
        }

        const handleResize = () => {
            setIsMobile(window.innerWidth < 1280); // Cambia a true si la pantalla es menor a "lg" (1024px)
        };

        handleResize(); // Ejecutar al cargar el componente
        window.addEventListener("resize", handleResize); // Escuchar cambios de tamaño

        return () => {
            window.removeEventListener("resize", handleResize); // Limpiar evento
        };
    }, [category, categoriesAndSubCategories])

    return(
        <>
        <div onMouseOver={!isMobile ? showSubCategories : null}
            onMouseLeave={!isMobile ? hideSubCategories : null}
            onClick={isMobile ? handleClick : null}
            className="text-xs 2xl:text-sm"
        >
            <Link
                id={`category-${category}-link`}
                className="category-link text-black font-medium uppercase font-poppins"
                to={`/productos/${category}`}
            >
                {category} |
            </Link>

            {activeCategory === category && (
                <div
                    className="bg-white flex flex-col items-center xl:items-start xl:pl-3 absolute w-[100vw] h-[200px] z-20 left-0 fade-in"
                    onMouseOver={showSubCategories}
                    onMouseLeave={hideSubCategories}
                >
                    {subCategories.map((subCategory, index) => {
                        const encodedSubcategory = encodeURIComponent(subCategory);
                        return (
                            <Link
                                to={`/productos/${category}/${encodedSubcategory}`}
                                key={index}
                                className="text-deepGray block px-4 pt-4 hover:bg-gray-200 hover:font-semibold transition ease-in duration-300
                                            font-poppins font-medium first-letter:uppercase"
                            >
                                {subCategory}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
        </>
    )
}
