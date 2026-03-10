// ProductsContainer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Cambios respecto a la versión original:
// - Cuando hay ?search= usa paginación por `page` (Typesense la necesita)
// - Cuando hay filtros puros usa cursor (`lastId`) igual que antes
// - El resto del comportamiento (infinite scroll, observer) es idéntico
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { Product } from "../Product/Product.jsx";
import { Filters } from "../Filters/Filters.jsx";
import { Loading } from "../Loading/Loading.jsx";
import { BsFilterLeft } from "react-icons/bs";
import { MdKeyboardArrowRight } from "react-icons/md";
import "../../pages/ProductosPage/productospage.css";
import { API_URL } from "../../utils/api_url.js";

export const ProductsContainer = ({ searchValue, setSearchValue }) => {
  const { category, subcategory, categories } = useParams();
  const encodedSubcategory = encodeURIComponent(subcategory);
  const productsPerPage = 10;

  const { refreshAuthUser } = useAuthContext();

  const [brand, setBrand] = useState(null);
  const [price, setPrice] = useState([]);
  const [showFilters, setShowFilter] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Para búsqueda: página actual de Typesense
  const currentPageRef = useRef(1);
  // Para cursor (filtros sin búsqueda)
  const productsRef = useRef([]);

  const observerTarget = useRef(null);
  const handleFilter = () => setShowFilter(v => !v);

  // ── Construir filtros ────────────────────────────────────────────────────
  const getCurrentFilters = useCallback(() => {
    const isPureSearch = !!searchValue;
    const filters = {
      ...(searchValue && { search: searchValue }),
      ...(!isPureSearch && {
        ...(category && { category }),
        ...(subcategory && { subcategory }),
        ...(brand && { brand }),
        ...(price.length > 0 && { minPrice: price[0], maxPrice: price[1] }),
      }),
    };
    return Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== "")
    );
  }, [searchValue, category, subcategory, brand, price]);

  // ── Cargar productos ─────────────────────────────────────────────────────
  const loadProducts = useCallback(async (filters, reset = true) => {
    if (loading) return;
    setLoading(true);

    if (reset) {
      setProducts([]);
      productsRef.current = [];
      currentPageRef.current = 1;
      setError(null);
    }

    try {
      let params;

      if (filters.search) {
        // Paginación por página (Typesense)
        params = {
          ...filters,
          limit: productsPerPage,
          page: currentPageRef.current,
        };
      } else {
        // Cursor-based (MongoDB)
        const lastProduct = productsRef.current[productsRef.current.length - 1];
        params = {
          ...filters,
          limit: productsPerPage,
          ...(!reset && lastProduct && { lastId: lastProduct._id }),
        };
      }

      const response = await axios.get(`${API_URL}/api/products`, {
        params,
        withCredentials: true,
      });

      const newProducts = response.data.products || [];

      if (reset) {
        setProducts(newProducts);
        productsRef.current = newProducts;
      } else {
        setProducts(prev => {
          const updated = [...prev, ...newProducts];
          productsRef.current = updated;
          return updated;
        });
        if (filters.search) currentPageRef.current += 1;
      }

      setHasMore(response.data.hasMore || false);
    } catch (err) {
      console.error("❌ Error loading products:", err);
      setError(err.response?.data?.message || "Error al cargar productos");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => { refreshAuthUser(); }, []);

  useEffect(() => {
    if (category || subcategory || categories) setSearchValue("");
  }, [category, subcategory, categories, setSearchValue]);

  useEffect(() => {
    const filters = getCurrentFilters();
    loadProducts(filters, true);
    if (!initialized) setInitialized(true);
  }, [category, subcategory, brand, price, searchValue]);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading || !initialized) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore && productsRef.current.length > 0) {
          loadProducts(getCurrentFilters(), false);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading, initialized]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className="text-cBlack text-xs font-poppins mt-[6rem] text-end flex justify-between w-[95%] m-auto">
        <div className="ml-4 text-sm xl:text-base italic font-semibold uppercase">
          {category && (
            <Link to={`/productos/${category}`}>
              {category}<MdKeyboardArrowRight className="inline-block" />
            </Link>
          )}
          {subcategory && (
            <Link className="first-letter:uppercase" to={`/productos/${category}/${encodedSubcategory}`}>
              {subcategory}
            </Link>
          )}
          {categories && (
            <Link className="first-letter:uppercase" to={`/productos/${category}/${encodedSubcategory}`}>
              <MdKeyboardArrowRight className="inline-block" />{categories}
            </Link>
          )}
        </div>
        <div>
          <button className="mr-4 sm:mr-8 text-sm xl:text-base text-cBlack">
            <span onClick={handleFilter}>{!showFilters ? "Mostrar Filtros" : "Ocultar Filtros"}</span>
            <BsFilterLeft className="inline-block" />
          </button>
        </div>
      </div>

      <div
        id="products-container"
        className={`grid grid-cols-1 ${showFilters ? "md:grid-cols-[30%_1fr] 2xl:grid-cols-[15%_1fr]" : "md:grid-cols-1"
          } w-full mt-10`}
      >
        {showFilters && (
          <div>
            <Filters filtered={{ setBrand, price, setPrice, setShowFilter }} />
          </div>
        )}

        <div
          className={`grid justify-items-center grid-cols-1 gap-3 ${!showFilters
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

        {hasMore && products.length > 0 && !loading && (
          <div ref={observerTarget} style={{ height: "20px" }} />
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
            No se encontraron productos
          </div>
        )}
      </div>
    </>
  );
};