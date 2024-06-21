import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { categoriesAndSubCategories } from "../../utils/categories&SubCategories.js";

export const Category = ({category}) => {
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [subCategories, setSubCategories] = useState([]);

    const showSubCategories = () => setDropdownVisible(true);
    /* const hideSubCategories = () => setDropdownVisible(false); */

    useEffect(() => {
        const categoryFound = categoriesAndSubCategories.find(elem => elem.category === category);
        if(categoryFound) {
            setSubCategories(categoryFound.subCategories)
        }
    }, [])

    return(
        <>
            <div
                className="relative flex justify-between items-center hover:cursor-pointer hover:bg-red hover:text-white transition duration-300"
                onMouseEnter={showSubCategories}
                /* onMouseLeave={hideSubCategories} */
            >
                <Link className="p-2 font-montserrat w-full uppercase" to={`/productos/${category}`} onMouseEnter={showSubCategories}>{category}</Link>
                <IoIosArrowForward className="mr-2" />
            </div>

            {
                isDropdownVisible && (
                    <>
                        {
                            subCategories.map((subCategory, index) => (
                                <Link to={`/productos/${category}/${subCategory}`} key={index} className="block px-4 py-2 hover:bg-gray-200 whitespace-nowrap">{subCategory}</Link>
                            ))
                        }
                    </>
                )
            }
        </>
    )
}