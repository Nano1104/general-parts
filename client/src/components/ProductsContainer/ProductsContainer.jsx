import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { useProductSearch } from "../../hooks/useProductSearch.js";
import { useParams, Link } from "react-router-dom";
/* import { categoriesAndSubCategories } from "../../utils/categories&SubCategories.js";
import { getSubcategory } from "../../utils/getSubcategory" */
//context
import { useAuthContext } from "../../context/AuthContext.jsx";
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



export const ProductsContainer = ({ searchValue, setSearchValue }) => {
  const { category, subcategory, categories } = useParams();
  const encodedSubcategory = encodeURIComponent(subcategory);
  const productsPerPage = 10;

  const { refreshAuthUser } = useAuthContext();

  const [brand, setBrand] = useState(null);
  const [price, setPrice] = useState([]);
  const [showFilters, setShowFilter] = useState(false);

  // Estados para manejar productos y paginación
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Referencias
  const observerTarget = useRef(null);

  const handleFilter = () => setShowFilter(showFilters => !showFilters);

  // Función para construir filtros actuales
  const getCurrentFilters = () => {
    const isPureSearch = !!searchValue;

    const filters = {
      ...(searchValue && { search: searchValue }),
      ...(!isPureSearch && {
        ...(category && { category }),
        ...(subcategory && { subcategory }),
        ...(brand && { brand }),
        ...(price.length > 0 && { minPrice: price[0], maxPrice: price[1] })
      })
    };

    // Limpiar valores undefined/null/empty
    return Object.fromEntries(
      Object.entries(filters).filter(([_, value]) =>
        value !== undefined && value !== null && value !== ""
      )
    );
  };

  // Función para cargar productos
  const loadProducts = async (filters, reset = true) => {
    if (loading) return;

    setLoading(true);
    if (reset) {
      setProducts([]);
      setError(null);
    }

    try {
      const params = {
        ...filters,
        limit: productsPerPage,
        // Solo incluir lastId si NO es reset y tenemos productos
        ...(!reset && products.length > 0 && {
          lastId: products[products.length - 1]?._id
        })
      };

      console.log("🔍 Loading products:", { params, reset });

      const response = await axios.get(`${API_URL}/api/products`, {
        params,
        withCredentials: true
      });

      const newProducts = response.data.products || [];

      console.log("📦 Received:", {
        count: newProducts.length,
        hasMore: response.data.hasMore
      });

      if (reset) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }

      setHasMore(response.data.hasMore || false);

    } catch (err) {
      console.error("❌ Error loading products:", err);
      setError(err.response?.data?.message || 'Error al cargar productos');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuthUser();
  }, []);

  // Efecto para resetear búsqueda cuando cambien las rutas
  useEffect(() => {
    if (category || subcategory || categories) {
      setSearchValue("");
    }
  }, [category, subcategory, categories, setSearchValue]);

  // Efecto ÚNICO que maneja toda la lógica de carga
  useEffect(() => {
    const filters = getCurrentFilters();

    console.log("🎯 Effect triggered:", {
      filters,
      initialized,
      category,
      subcategory,
      searchValue,
      brand,
      price
    });

    // Siempre cargar (inicial o por cambio de filtros)
    loadProducts(filters, true);

    if (!initialized) {
      setInitialized(true);
    }

  }, [category, subcategory, brand, price, searchValue]); // Solo dependencias de filtros

  // Efecto separado SOLO para el observer
  useEffect(() => {
    if (!hasMore || loading || !initialized) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore && products.length > 0) {
          console.log("👀 Loading more products");
          const filters = getCurrentFilters();
          loadProducts(filters, false);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, products.length, initialized]);




  return (
    <>
      {/* LINK DE CATEGORIAS Y SUBCATEGORIAS */}
      <div className="text-cBlack text-xs font-poppins mt-[6rem] text-end flex justify-between w-[95%] m-auto">
        <div className="ml-4 text-sm xl:text-base italic font-semibold uppercase">
          {category && <Link to={`/productos/${category}`}>{category}<MdKeyboardArrowRight className="inline-block" /></Link>}
          {subcategory && <Link className="first-letter:uppercase" to={`/productos/${category}/${encodedSubcategory}`}>{subcategory}</Link>}
          {categories && <Link className="first-letter:uppercase" to={`/productos/${category}/${encodedSubcategory}`}><MdKeyboardArrowRight className="inline-block" />{categories}</Link>}
        </div>

        <div>
          <button className="mr-4 sm:mr-8 text-sm xl:text-base text-cBlack">
            <span onClick={handleFilter}>{!showFilters ? "Mostrar Filtros" : "Ocultar Filtros"}</span>
            <BsFilterLeft className="inline-block" />
          </button>
        </div>
      </div>

      {/* Debug info - quitar en producción */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="w-[95%] m-auto text-xs text-gray-500 mb-2">
          Productos: {products.length} | Loading: {loading.toString()} | HasMore: {hasMore.toString()} | Initialized: {initialized.toString()}
        </div>
      )} */}

      {/* FILTROS DE PRODUCTOS */}
      <div id="products-container" className={`grid grid-cols-1 ${showFilters ? 'md:grid-cols-[30%_1fr] 2xl:grid-cols-[15%_1fr]' : 'md:grid-cols-1'} w-full mt-10`}>
        {showFilters && (
          <div>
            <Filters filtered={{ setBrand, price, setPrice, setShowFilter }} />
          </div>
        )}

        <div
          className={`grid justify-items-center grid-cols-1 gap-3
          ${!showFilters
              ? "md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-6"
              : "md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 2xl:gap-6"
            }`}
        >
          {products.map((prod, index) => (
            <Product
              key={`${prod._id}-${index}`}
              data={prod}
              params={[category, subcategory]}
              featured={false}
            />
          ))}
        </div>

        {/* Elemento observer y mensajes */}
        {hasMore && products.length > 0 && !loading && (
          <div ref={observerTarget} style={{ height: '20px', backgroundColor: 'transparent' }} />
        )}

        {loading && <Loading />}

        {error && (
          <div className="col-span-full text-center text-xl mt-8 py-4 text-red-500">
            {error}
          </div>
        )}

        {!hasMore && !loading && products.length > 0 && (
          <div className="col-span-full text-center text-xl mt-8 py-4 text-gray-500 text-cBlack italic">
            Fin de los resultados ({products.length} productos encontrados)
          </div>
        )}

        {!loading && products.length === 0 && !error && initialized && (
          <div className="col-span-full text-center text-xl mt-8 py-4 text-gray-500 text-cBlack italic">
            No se encontraron productos con los filtros seleccionados
          </div>
        )}
      </div>
    </>
  );
};