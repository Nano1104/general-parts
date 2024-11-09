import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { categoriesAndSubCategories } from "../../utils/categories&SubCategories.js";
//components
import { Category } from "../Category/Category.jsx";
//icons
import { HiHome } from "react-icons/hi2";

export const InventaryList = () => {
    const [categories, setCategories] = useState([])
    const [activeCategory, setActiveCategory] = useState(null);

    useEffect(() => {
        setCategories(categoriesAndSubCategories.map(cat => cat.category))    
    }, [])

    return(
        <>
            <nav className="bg-gray py-1 relative px-7"> 
                <ul className="flex items-center justify-center xl:justify-start gap-2">
                    {
                        categories.map((category, index) => <Category
                                                                key={`category-${category}-${index}`}
                                                                category={category}
                                                                activeCategory={activeCategory}
                                                                setActiveCategory={setActiveCategory}
                                                                categoriesAndSubCategories={categoriesAndSubCategories}
                                                            /> )
                    }
                </ul>
            </nav>
        </>
    )
}