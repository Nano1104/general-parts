import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { productos } from "../../utils/datamock.js";
import { Category } from "../Category/Category.jsx";

import { HiHome } from "react-icons/hi2";

export const InventaryList = () => {
    const [categories, setCategories] = useState([])

    useEffect(() => {
        setCategories(productos)
    }, [])

    return(
        <>
            <nav className="bg-white h-[100vh] w-[15%] absolute">
                <ul className="flex gap-3 flex-col h-full">
                    {
                        categories.map(prod => <Category category={prod.CATEGORIA} /> )
                    }
                    <hr />
                    <Link to="/" className="m-auto"><HiHome className="text-gray text-3xl" /></Link>
                </ul>
            </nav>
        </>
    )
}