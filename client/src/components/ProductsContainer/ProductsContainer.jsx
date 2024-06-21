import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { categoriesAndSubCategories } from "../../utils/categories&SubCategories.js";

import { Product } from "../Product/Product.jsx";
import { Loading } from "../Loading/Loading.jsx";
import "../../pages/ProductosPage/productospage.css"

export const ProductsContainer = () => {
    const { category, subcategory } = useParams();
    const [prodsToRender, setProdsToRender] = useState([]);
    const [loading, setLoading] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await axios.get("/api/products", { withCredentials: true })
                if(subcategory) {
                    const prodsWithSubCategory = res.data.products.filter(prods => prods.desc_rubro === subcategory.toUpperCase())
                    setProdsToRender(prodsWithSubCategory)
                } else if(category) {
                    const categoryFound = categoriesAndSubCategories.find(cat => cat.category === category);
                    const prodsCategory = res.data.products.filter(prods => prods.subrub === categoryFound.idCategory);
                    setProdsToRender(prodsCategory)
                } else {
                    setProdsToRender(res.data.products)
                }
            } catch (err) {
                console.log("Error redering products", err)
            } finally {
                setLoading(false);
            }
            
        }

        fetchData()
    }, [category, subcategory])

    return(
        <>
        <div id="products-container" className="bg-lightGray flex flex-wrap gap-10 items-center justify-center p-10 overflow-y-auto">
            {
                loading
                ?
                <Loading />
                :
                <>
                    <h1 className="text-3xl text-center">{category}</h1>
                    {
                        prodsToRender.map(prod => <Product key={prod.codpro} data={prod} />)
                    }
                </>
            }
        </div>
        </>
    )
}