import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { categoriesAndSubCategories } from "../../utils/categories&SubCategories.js";

import "./category.css"
import 'animate.css';

export const Category = ({category, activeCategory, setActiveCategory, categoriesAndSubCategories}) => {
    const [subCategories, setSubCategories] = useState([]);

    const showSubCategories = () => setActiveCategory(category)
    const hideSubCategories = () => setActiveCategory(null);

    useEffect(() => {
        const categoryFound = categoriesAndSubCategories.find(elem => elem.category === category);
        if(categoryFound) {
            setSubCategories(categoryFound.subCategories)
        }
    }, [category, categoriesAndSubCategories])

    return(
        <>
        <div onMouseOver={showSubCategories} onMouseLeave={hideSubCategories} className="">
            <Link
                id={`category-${category}-link`}
                className="category-link text-black font-medium text-sm uppercase font-poppins"
                to={`/productos/${category}`}
            >
                {category} |
            </Link>

            {activeCategory === category && (
                <div
                    className="bg-white absolute w-[100vw] h-[200px] z-20 left-0 fade-in"
                    onMouseOver={showSubCategories}
                    onMouseLeave={hideSubCategories}
                >
                    {subCategories.map((subCategory, index) => {
                        const encodedSubcategory = encodeURIComponent(subCategory);
                        return (
                            <Link
                                to={`/productos/${category}/${encodedSubcategory}`}
                                key={index}
                                className="text-deepGray block px-4 pt-4 hover:bg-gray-200 font-poppins font-medium first-letter:uppercase text-[14px]"
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
