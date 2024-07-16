import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { categoriesAndSubCategories } from "../../utils/categories&SubCategories.js";

//components
import { Product } from "../Product/Product.jsx";
import { Loading } from "../Loading/Loading.jsx";
//icons
import { BsFilterLeft } from "react-icons/bs";
import { MdKeyboardArrowRight } from "react-icons/md";
//css
import "../../pages/ProductosPage/productospage.css"

export const ProductsContainer = ({ searchValue }) => {         //valor de la barra de busqueda
    const { category, subcategory } = useParams();
    const encodedSubcategory = encodeURIComponent(subcategory);

    const [prodsToRender, setProdsToRender] = useState([]);     //productos que renderiza la pagina
    const [loading, setLoading] = useState();                   //loading del renderizado
    const [filter, setFilter] = useState(true);                 //ocultar o mostrar los filtros de busqueda

    const handleFilter = () => {
        setFilter(filter => !filter);
    }

    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await axios.get("/api/products", { withCredentials: true })
                if(subcategory) {
                    const prodsWithSubCategory = res.data.products.filter(prods => prods.desc_subrubro === subcategory.toUpperCase())
                    setProdsToRender(prodsWithSubCategory)
                    console.log(prodsToRender)
                } else if(category) {
                    const categoryFound = categoriesAndSubCategories.find(cat => cat.category === category);
                    const prodsCategory = res.data.products.filter(prods => prods.subrub === categoryFound.idCategory);
                    setProdsToRender(prodsCategory)
                } else {
                    setProdsToRender(res.data.products)
                }
                
                if(searchValue) {
                    setProdsToRender(prodsToRender.filter(prod => prod.desc_stock.toLowerCase().includes(searchValue.toLowerCase())))
                }
            } catch (err) {
                console.log("Error redering products", err)
            } finally {
                setLoading(false);
            }
            
        }

        fetchData()
    }, [category, subcategory, searchValue])

    return(
        <>
        <div className="text-white font-poppins mt-14 text-end flex justify-between w-full">
            <div className="ml-4 italic font-normal uppercase">
                { category ? <Link className="" to={`/productos/${category}`} >{category}<MdKeyboardArrowRight className="inline-block" /></Link> : "" }
                { subcategory ? <Link className="first-letter:uppercase" to={`/productos/${category}/${encodedSubcategory}`} >{subcategory}</Link> : "" }
            </div>
            <div>
                <button className=" mr-6">
                    <span onClick={handleFilter}>{filter ? "Mostrar Filtros" : "Ocultar Filtros"}</span><BsFilterLeft className="inline-block text-xl"/>
                </button>

                <label htmlFor="price-sort">Ordenar por:</label>
                <select name="price-sort" id="price-sort" className="text-black ml-2 mr-6 rounded-xl">
                    <option value="default" disabled selected>Seleccionar</option>
                    <option value="high-to-low">Mayor a menor precio</option>
                    <option value="low-to-high">Menor a mayor precio</option>
                </select>
            </div>
        </div>

        <div id="products-container" className="flex flex-wrap w-full mt-10 justify-evenly items-center">
            {
                /* loading
                ? <Loading />
                : prodsToRender.map(prod => <Product key={prod.codpro} data={prod} params={[category, subcategory]} />) */
                prodsToRender.map(prod => <Product key={prod.codpro} data={prod} params={[category, subcategory]} />)
            }
        </div>
        </>
    )
}