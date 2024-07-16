import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { categoriesAndSubCategories } from "../../utils/categories&SubCategories.js";

import "./category.css"
import 'animate.css';

export const Category = ({category}) => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [subCategories, setSubCategories] = useState([]);

    const showSubCategories = () => setDropdownVisible(true);
    const hideSubCategories = () => setDropdownVisible(false);

    useEffect(() => {
        const categoryFound = categoriesAndSubCategories.find(elem => elem.category === category);
        if(categoryFound) {
            setSubCategories(categoryFound.subCategories)
        }
    }, [])

    return(
        <>
            <Link 
                id={`category-${category}-link`}
                className="category-link text-black font-medium text-sm uppercase font-poppins"
                to={`/productos/${category}`}
                onMouseLeave={hideSubCategories}
                onMouseOver={showSubCategories}>{category} |
            </Link>

            {
                isDropdownVisible && (
                    <>
                        <div
                        className={`bg-white border border-white w-full h-[200px] absolute z-20 top-[100%] left-0`}
                        onMouseOver={showSubCategories}
                        onMouseLeave={hideSubCategories}
                        >
                            {
                                subCategories.map((subCategory, index) => {
                                    const encodedSubcategory = encodeURIComponent(subCategory);
                                    return <Link to={`/productos/${category}/${encodedSubcategory}`}
                                                key={index}
                                                className="text-deepGray block px-4 py-2 hover:bg-gray-200 whitespace-nowrap font-medium first-letter:uppercase font-poppins text-[14px]">
                                                {subCategory}
                                            </Link>
                                })
                            }
                        </div>
                    </>
                )
            }
        </>
    )
}
