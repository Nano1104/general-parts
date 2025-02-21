import { useEffect, useState } from "react";
import { categoriesAndSubCategories } from "../../utils/categories&SubCategories.js";
//components
import { Category } from "../Category/Category.jsx";

export const InventaryList = ({ stateNews }) => {
    const { setShowNews } = stateNews
    const [categories, setCategories] = useState([])
    const [showCategories, setShowCategories] = useState(false)

    const [activeCategory, setActiveCategory] = useState(null);
    const [activeSubCategory, setActiveSubCategory] = useState(null)

    useEffect(() => {
        setCategories(categoriesAndSubCategories)    
        console.log(categories)
    }, [])

    return(
        <>
            <nav className="bg-gray flex h-8 relative px-7"> 
                <span className="font-medium flex items-center italic mobile:text-sm xl:text-base px-4 h-full bg-black text-lightGray uppercase font-poppins tracking-tight cursor-pointer" onClick={() => {
                    setShowCategories(showCategories => !showCategories)
                    setShowNews(false)
                }}>CATEGORIAS</span>
                <span className="font-medium flex items-center italic mobile:text-sm xl:text-base ml-4 px-4 text-black  bg-orange h-full uppercase font-poppins tracking-tight cursor-pointer" onClick={() => {
                    setShowCategories(false)
                    setShowNews(true)
                }}>DESTACADO</span>
                {
                    showCategories
                    ?
                    <ul className="flex flex-col mt-8 absolute top-0 left-0 gap-2 bg-gray px-10 py-2">
                    {
                        categories.map((category, index) => <Category
                                                                key={`category-${category.description}-${index}`}
                                                                category={category.description}
                                                                activeCategory={activeCategory}
                                                                setActiveCategory={setActiveCategory}
                                                                activeSubCategory={activeSubCategory}
                                                                setActiveSubCategory={setActiveSubCategory}
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