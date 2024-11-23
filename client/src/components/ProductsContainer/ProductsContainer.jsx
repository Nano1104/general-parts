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




export const ProductsContainer = ({ searchValue }) => {                 //valor de la barra de busqueda
    const { category, subcategory } = useParams();
    const encodedSubcategory = encodeURIComponent(subcategory);

    const [prodsToRender, setProdsToRender] = useState([]);             //productos que renderiza la pagina
    const [loading, setLoading] = useState();                           //loading del renderizado
    const [filterBrands, setFilterBrands] = useState([]);               //marcas del menu para filtrar
    const [price, setPrice] = useState([]);                             //precios del menu para filtrar
    const [showFilters, setShowFilter] = useState(false);               //ocultar o mostrar los filtros de busqueda

    const handleFilter = () => setShowFilter(showFilters => !showFilters);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.get("/api/products", { withCredentials: true });
                let products = res.data.products;
    
                // Filtrar por subcategoría y categoría
                if (subcategory) {
                    products = products.filter(prod => prod.desc_subrubro === subcategory.toUpperCase());
                } else if (category) {
                    const categoryFound = categoriesAndSubCategories.find(cat => cat.category === category);
                    products = products.filter(prod => prod.subrub === categoryFound.idCategory);
                }
    
                // Filtrar por valor de búsqueda
                if (searchValue) {
                    products = products.filter(prod => prod.desc_stock.toLowerCase().includes(searchValue.toLowerCase()));
                }
    
                // Filtrar por marca
                if (filterBrands.length > 0) {
                    products = products.filter(prod => filterBrands.includes(prod.desc_marca));
                }

                // Filtrar por precio
                if (price.length > 0) {
                    console.log(typeof price, price.length)
                    if (price.length > 1) {     //si el array tiene mas de una valor como: [10000, 80000]
                        products = products.filter(prod => prod.precioimpre >= price[0] && prod.precioimpre <= price[1]);
                    } else {        //un valor solo: [80000]
                        products = products.filter(prod => prod.precioimpre > price[0])
                    }
                }
    
                setProdsToRender(products);
            } catch (err) {
                console.log("Error rendering products", err);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();
    }, [category, subcategory, searchValue, filterBrands, price]);

    return(
        <>
        <div className="text-white text-xs font-poppins mt-[6rem] text-end flex justify-between w-[95%] m-auto">

            <div className="ml-4 text-sm italic font-normal uppercase">
                { category ? <Link className="" to={`/productos/${category}`} >{category}<MdKeyboardArrowRight className="inline-block" /></Link> : "" }
                { subcategory ? <Link className="first-letter:uppercase" to={`/productos/${category}/${encodedSubcategory}`} >{subcategory}</Link> : "" }
            </div>
            <div>
                <button className="mr-4 sm:mr-8 text-sm">
                    <span onClick={handleFilter}>{!showFilters ? "Mostrar Filtros" : "Ocultar Filtros"}</span><BsFilterLeft className="inline-block"/>
                </button>
            </div>
        </div>

        <div id="products-container" className={`grid grid-cols-1 ${ showFilters ? `md:grid-cols-[30%_1fr] 2xl:grid-cols-[15%_1fr]` : `md:grid-cols-1` } w-full mt-10`}>
            {showFilters && (
                <div>
                    <Filters filtered={{ filterBrands, setFilterBrands, price, setPrice, setShowFilter }} />
                </div>
            )}

            {/* Columna de productos */}
            <div className={`grid gap-3 justify-items-center grid-cols-1 ${!showFilters ? "md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" : "md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3"}`}>
                {loading ? (
                    <Loading />
                ) : (
                    prodsToRender.map((prod) => (
                    <Product key={prod.codpro} data={prod} params={[category, subcategory]} />
                    ))
                )}
            </div>
        </div>
        </>
    )
}