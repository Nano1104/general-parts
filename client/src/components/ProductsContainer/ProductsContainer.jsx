import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";

import { useParams, Link } from "react-router-dom";
import { categoriesAndSubCategories } from "../../utils/categories&SubCategories.js";
import { getSubcategory } from "../../utils/getSubcategory"

//components
import { Product } from "../Product/Product.jsx";
import { Filters } from "../Filters/Filters.jsx"
import { Loading } from "../Loading/Loading.jsx";
//icons
import { BsFilterLeft } from "react-icons/bs";
import { MdKeyboardArrowRight } from "react-icons/md";
//css
import "../../pages/ProductosPage/productospage.css"

import { API_URL } from "../../utils/api_url.js";


export const ProductsContainer = ({ searchValue }) => {                 //valor de la barra de busqueda
    const { category, subcategory, categories } = useParams();
    const encodedSubcategory = encodeURIComponent(subcategory);

    const [prodsToRender, setProdsToRender] = useState([]);             //productos que renderiza la pagina
    const [loading, setLoading] = useState(false);                          
    const [hasMore, setHasMore] = useState(true);                       // <-- Controlador de fin de datos (productos)
    const productsPerPage = 10

    const [brand, setBrand] = useState(null);               //marcas del menu para filtrar
    const [price, setPrice] = useState([]);                             //precios del menu para filtrar
    const [showFilters, setShowFilter] = useState(false);               //ocultar o mostrar los filtros de busqueda

    const handleFilter = () => setShowFilter(showFilters => !showFilters);

    const observerTarget = useRef(null);
    const loadingRef = useRef(false); // Referencia para acceso en callbacks


    useEffect(() => {
        setProdsToRender([]);
        setHasMore(true);
    }, [searchValue, category, subcategory, categories, brand, price]);

    ///////load more products
    const loadMoreProducts = useCallback(async () => {
        if (!hasMore || loadingRef.current) return;
        
        loadingRef.current = true;
        setLoading(true);
        
        try {
            // Pequeño delay para evitar saturación
            await new Promise(resolve => setTimeout(resolve, 300));

            const lastId = prodsToRender?.length > 0 
                ? prodsToRender[prodsToRender.length - 1]._id 
                : null;

        
            //parametros para los filtros
            const params = {
                limit: productsPerPage,
                ...(lastId && { lastId }), // Solo si existe
                ...(category && { category }),
                ...(subcategory && { subcategory: subcategory }),
                ...(categories && { categories: categories }),
                ...(searchValue && { search: encodeURIComponent(searchValue) }),
                ...(brand && { brand }),
                ...(price.length === 2 && { 
                    minPrice: price[0], 
                    maxPrice: price[1] 
                })
            };

            const response = await axios.get(`${API_URL}/api/products`, { 
                withCredentials: true,
                params,
                headers: {
                    'Cache-Strategy': 'stale-while-revalidate' // Opcional
                }
            });
            /* console.log("🚀 ~ loadMoreProducts ~ response:", response) */
            const { products, hasMore } = response.data;

            if (products.length > 0) {
                setProdsToRender(prev => [...prev, ...products]);
                setHasMore(products.length >= productsPerPage);
            } else {
                setHasMore(false);
            }
        } catch (err) {
          console.error("Error:", err);
          setHasMore(false); // Asumimos fin de los datos en caso de error
        } finally {
          loadingRef.current = false;
          setLoading(false);
        }
      }, [prodsToRender, hasMore, productsPerPage, 
        category, encodedSubcategory, categories, searchValue, brand, price])

      useEffect(() => {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
                loadMoreProducts();
            }
          },
          { threshold: 0.1 }
        );
    
        const currentTarget = observerTarget.current;
        if (currentTarget) observer.observe(currentTarget);
    
        return () => {
          if (currentTarget) observer.unobserve(currentTarget);
          observer.disconnect();
        };
      }, [loadMoreProducts]); // Dependencia estable

    return(
        <>
        {/*  LINK DE CATEGOIRAS Y SUBCATEGORIAS JUNTO CON MOSTRAR Y OCULTAR PRODUCTOS */} 
        <div className="text-white text-xs font-poppins mt-[6rem] text-end flex justify-between w-[95%] m-auto">
            <div className="ml-4 text-sm xl:text-base italic font-normal uppercase">
                { category ? <Link className="" to={`/productos/${category}`} >{category}<MdKeyboardArrowRight className="inline-block" /></Link> : "" }
                { subcategory ? <Link className="first-letter:uppercase" to={`/productos/${category}/${encodedSubcategory}`} >{subcategory}</Link> : "" }
                { categories ? <Link className="first-letter:uppercase" to={`/productos/${category}/${encodedSubcategory}`} ><MdKeyboardArrowRight className="inline-block" />{categories}</Link> : ""  }
            </div>
            <div>
                <button className="mr-4 sm:mr-8 text-sm xl:text-base">
                    <span onClick={handleFilter}>{!showFilters ? "Mostrar Filtros" : "Ocultar Filtros"}</span><BsFilterLeft className="inline-block"/>
                </button>
            </div>
        </div>

        {/* CONTAINER DE PRODUCTOS JUNTO CON FILTERS */}
        <div id="products-container" className={`grid grid-cols-1 ${ showFilters ? `md:grid-cols-[30%_1fr] 2xl:grid-cols-[15%_1fr]` : `md:grid-cols-1` } w-full mt-10`}>
            {showFilters && (
                <div>
                    <Filters filtered={{ setBrand, price, setPrice, setShowFilter }} />
                </div>
            )}

            {/* Columna de productos */}
            <div ref={observerTarget} className={`grid gap-3 justify-items-center grid-cols-1 ${!showFilters ? "md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" : "md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3"}`}>
                {
                    prodsToRender.map((prod, index) => (
                        <Product key={`${prod.codpro}-${index}`} data={prod} params={[category, subcategory]} featured={false} />
                    ))
                }
                {/* <span className="col-span-full italic text-xl px-4 py-2 text-gray">No hay productos que cumplan con los filtros</span> */}
            </div>
            <div ref={observerTarget} style={{ height: '1px' }}> </div> 

            {loading && <Loading />}
            {!hasMore && !loading && prodsToRender.length > 0 && (
                <div className="col-span-full text-center text-xl mt-8 py-4 text-gray-500 text-gray italic">
                    No hay más productos por cargar
                </div>
            )}
        </div>
        </>
    )
}