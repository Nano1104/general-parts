import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io"; //flecha abajo
import { IoIosArrowUp } from "react-icons/io"; //flecha arriba
import { IoIosArrowBack } from "react-icons/io";   //flecha mirando izquierda
import { IoIosArrowForward } from "react-icons/io"; //flecha mirando derecha

import 'animate.css';

export const Category = ({category, activeCategory, setActiveCategory, categoriesAndSubCategories}) => {
    const [subCategories, setSubCategories] = useState([]);
    const [showMenu, setShowMenu] = useState(false);

    const handleClick = () => setShowMenu(showMenu => !showMenu);

    const showSubCategories = (category) => {
        if(category) {
            setActiveCategory(category);
        } else {
            setActiveCategory(null)
        }
    }
    const hideSubCategories = () => setActiveCategory(null);

    useEffect(() => {
        const categoryFound = categoriesAndSubCategories.find(elem => elem.category === category);
        if(categoryFound) {
            setSubCategories(categoryFound.subCategories)
        }

    }, [category, categoriesAndSubCategories])

    return(
        <>
        <div className="text-xs 2xl:text-sm relative">
            <div className="flex items-center gap-1">
                <Link
                    id={`category-${category}-link`}
                    className={`category-link gap-1 text-black font-medium lg:${ activeCategory != category ? "font-normal" : "font-bold" } text-base mb-1 uppercase font-poppins`}
                    to={`/productos/${category}`}
                >
                    {category}
                </Link>
                { activeCategory != category ? <IoIosArrowUp onClick={() => showSubCategories(category)} className="text-base mb-1 cursor-pointer" /> : <IoIosArrowForward onClick={() => showSubCategories(null)} className="text-base mb-1 cursor-pointer" /> }

                { activeCategory == category && (
                <div className="bg-gray flex flex-col w-[20vw] h-[20vh] absolute top-0 left-[10.8em] border">
                    {subCategories.map((subCategory, index) => {
                        const encodedSubcategory = encodeURIComponent(subCategory);
                        return (
                            <Link
                                to={`/productos/${category}/${encodedSubcategory}`}
                                key={index}
                                className="text-cBlack block px-4 pt-4 hover:bg-gray-200 hover:font-semibold transition ease-in duration-300
                                            font-poppins font-medium first-letter:uppercase"
                            >
                                {subCategory}
                            </Link>
                        );
                    })}
                </div>
            )}
            </div> { showMenu ? <hr/> : <></> }

            
        </div>
        </>
    )
}

/* className="bg-gray flex flex-col pl-3 xl:items-start absolute w-[100vw] h-[200px] z-20 left-0 fade-in"> */