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
            <nav className="bg-white" id="nav-categories">
                <h3 className="font-semibold text-white w-full h-[50px] bg-red flex justify-center items-center border-b-white">Repuestos</h3>
                <ul className="flex gap-3 flex-col h-full">
                    {
                        categories.map((category, index) => <Category key={`category-${category}-${index}`} category={category} /> )
                    }
                    <hr />
                    {
                        authUser && authUser.role === "admin"
                        ? <Link to="/admin">VER PAGINA DE ADMIN</Link>
                        : null
                    }
                    <Link to="/" className="m-auto"><HiHome className="text-gray text-3xl" /></Link>
                </ul>
            </nav>
        </>
    )
}