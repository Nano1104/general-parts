import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { categoriesAndSubCategories } from "../../utils/categories&SubCategories.js";
//components
import { Category } from "../Category/Category.jsx";
//icons
import { HiHome } from "react-icons/hi2";

export const InventaryList = ({ stateNews }) => {
    const { setShowNews } = stateNews
    const [categories, setCategories] = useState([])
    const [showCategories, setShowCategories] = useState(false)
    const [activeCategory, setActiveCategory] = useState(null);

    useEffect(() => {
        setCategories(categoriesAndSubCategories.map(cat => cat.category))    
    }, [])

    return(
        <>
            <nav className="bg-gray py-1 relative px-7"> 
                <span className="font-semibold text-sm uppercase font-poppins tracking-tight cursor-pointer" onClick={() => {
                    setShowCategories(showCategories => !showCategories)
                    setShowNews(false)
                }}>CATEGORIAS</span>
                <span className="font-semibold text-sm uppercase font-poppins mx-2">-</span>
                <span className="font-semibold text-sm uppercase font-poppins tracking-tight cursor-pointer" onClick={() => {
                    setShowCategories(false)
                    setShowNews(true)
                }}>DESTACADO</span>
                {
                    showCategories
                    ?
                    <ul className="flex flex-col mt-2 gap-2">
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
                    : <></>
                }
            </nav>
        </>
    )
}