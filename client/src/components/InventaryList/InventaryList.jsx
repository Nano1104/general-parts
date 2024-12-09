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
            <nav className="bg-gray flex items-center h-8 relative px-7"> 
                <span className="font-medium italic mobile:text-sm xl:text-lg px-4 h-full bg-black text-lightGray uppercase font-poppins tracking-tight cursor-pointer" onClick={() => {
                    setShowCategories(showCategories => !showCategories)
                    setShowNews(false)
                }}>CATEGORIAS</span>
                {/* <span className="font-semibold mobile:text-sm xl:text-lg uppercase font-poppins mx-2">-</span> */}
                <span className="font-medium italic mobile:text-sm xl:text-lg ml-4 px-4 text-cBlack  bg-orange h-full uppercase font-poppins tracking-tight cursor-pointer" onClick={() => {
                    setShowCategories(false)
                    setShowNews(true)
                }}>DESTACADO</span>
                {
                    showCategories
                    ?
                    <ul className="flex flex-col mt-8 absolute top-0 left-0 gap-2 bg-gray px-10 py-2">
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