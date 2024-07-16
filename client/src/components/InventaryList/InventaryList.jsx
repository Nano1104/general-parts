import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { categoriesAndSubCategories } from "../../utils/categories&SubCategories.js";
import { useAuthContext } from "../../context/AuthContext.jsx";
//components
import { Category } from "../Category/Category.jsx";
//icons
import { HiHome } from "react-icons/hi2";

export const InventaryList = () => {
    const { authUser } = useAuthContext();
    const [categories, setCategories] = useState([])

    useEffect(() => {
        console.log(authUser)
        setCategories(categoriesAndSubCategories.map(cat => cat.category))    
    }, [])

    return(
        <>
            <nav className="bg-gray py-1 relative px-7"> 
                <ul className="flex items-center gap-2">
                    {
                        categories.map((category, index) => <Category key={`category-${category}-${index}`} category={category} /> )
                    }
                </ul>
            </nav>
        </>
    )
}