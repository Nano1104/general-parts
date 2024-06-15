import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { productos } from "../../utils/datamock.js";

import { Product } from "../Product/Product.jsx";

export const ProductsContainer = () => {
    const { category } = useParams();
    const [prodsToRender, setProdsToRender] = useState([]);

    useEffect(() => {
        if(category) {
            const prodsWithCorrectCategory = productos.filter(prods => prods.CATEGORIA === category);
            setProdsToRender(prodsWithCorrectCategory)
        } else {
            setProdsToRender(productos);
        }
        console.log(prodsToRender)
    }, [category])

    return(
        <>
        <div id="products-container" className="w-[100%] h-[100vh] bg-lightGray">
            <h1 className="text-3xl text-center">{category}</h1>
            {
                prodsToRender.map(prod => <Product data={prod} />)
            }
        </div>
        </>
    )
}