import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { categoriesAndSubCategories } from "../../utils/categories&SubCategories.js";

//components
import { Product } from "../Product/Product.jsx";
import { Filters } from "../Filters/Filters.jsx"
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
    const [filterBrands, setFilterBrands] = useState([]);              
    const [filterPrice, setFilterPrice] = useState(null);   
    const [showFilters, setShowFilter] = useState(false);                 //ocultar o mostrar los filtros de busqueda

    const handleFilter = () => {
        setShowFilter(showFilters => !showFilters);
    }

    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                const res = await axios.get("/api/products", { withCredentials: true })
                const products = res.data.products
                if(subcategory) {
                    const prodsWithSubCategory = products.filter(prods => prods.desc_subrubro === subcategory.toUpperCase())
                    setProdsToRender(prodsWithSubCategory)
                } else if(category) {
                    const categoryFound = categoriesAndSubCategories.find(cat => cat.category === category);
                    const prodsCategory = products.filter(prods => prods.subrub === categoryFound.idCategory);
                    setProdsToRender(prodsCategory)
                } else {
                    setProdsToRender(products)
                }
                
                if(searchValue) {       //barra de busqueda
                    setProdsToRender(products.filter(prod => prod.desc_stock.toLowerCase().includes(searchValue.toLowerCase())))
                }

                if(filterBrands.length > 0) {   //filtros
                    console.log(filterBrands)
                    console.log(products.filter(prod => filterBrands.includes(prod.desc_marca))) 
                    setProdsToRender(products.filter(prod => filterBrands.some(brand => brand == prod.desc_marca)))
                }
            } catch (err) {
                console.log("Error redering products", err)
            } finally {
                setLoading(false);
            }
        }
        fetchData()
        
    }, [category, subcategory, searchValue, filterBrands])

    return(
        <>
        <div className="text-white font-poppins mt-[6rem] text-end flex justify-between w-[95%] m-auto">

            <div className="ml-4 italic font-normal uppercase">
                { category ? <Link className="" to={`/productos/${category}`} >{category}<MdKeyboardArrowRight className="inline-block" /></Link> : "" }
                { subcategory ? <Link className="first-letter:uppercase" to={`/productos/${category}/${encodedSubcategory}`} >{subcategory}</Link> : "" }
            </div>
            <div>
                <button className="mr-4">
                    <span onClick={handleFilter}>{!showFilters ? "Mostrar Filtros" : "Ocultar Filtros"}</span><BsFilterLeft className="inline-block text-xl"/>
                </button>
            </div>
        </div>

        <div id="products-container" className="grid grid-cols-[1fr_3fr_3fr_3fr] w-full mt-10 relative">
            {
                showFilters
                ? <Filters filtered={{filterBrands, setFilterBrands, filterPrice, setFilterPrice}} />
                : <></>
            }
            <div className={`col-start-${ showFilters ? '2' : '1' } col-span-${ showFilters ? '3' : '4' } flex flex-wrap justify-around gap-3`}>
                {
                loading 
                ? <Loading />
                : (
                    prodsToRender.map((prod) => (
                        <Product key={prod.codpro} data={prod} params={[category, subcategory]} />
                    ))
                )}
            </div>
        </div>
        </>
    )
}