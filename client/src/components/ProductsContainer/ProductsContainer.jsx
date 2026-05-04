// ProductsContainer.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Cambios respecto a la versión original:
// - Cuando hay ?search= usa paginación por `page` (Typesense la necesita)
// - Cuando hay filtros puros usa cursor (`lastId`) igual que antes
// - El resto del comportamiento (infinite scroll, observer) es idéntico
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { Product } from "../Product/Product.jsx";
import { Filters } from "../Filters/Filters.jsx";
import { Loading } from "../Loading/Loading.jsx";
import { useProducts } from "../../hooks/useProducts.js";
import { BsFilterLeft } from "react-icons/bs";
import { MdKeyboardArrowRight } from "react-icons/md";
import "../../pages/ProductosPage/productospage.css";

export const ProductsContainer = ({ searchValue, setSearchValue }) => {
  const { category, subcategory, categories } = useParams();
  const [brand, setBrand] = useState(null);
  const [price, setPrice] = useState([]);
  const [showFilters, setShowFilter] = useState(false);
  const observerTarget = useRef(null);

  const encodedSubcategory = subcategory ? encodeURIComponent(subcategory) : "";

  const handleFilter = () => setShowFilter(v => !v);

  const { products, loading, hasMore, error, loadMore } = useProducts({
    searchValue,
    category,
    subcategory,
    brand,
    price,
  });

  // Limpiar búsqueda al navegar
  useEffect(() => {
    if (category || subcategory) setSearchValue("");
  }, [category, subcategory]);

  // Infinite scroll — ahora el observer es estable porque loadMore no cambia
  useEffect(() => {
    if (!observerTarget.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );

    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loadMore]);  // loadMore es estable gracias a useCallback

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
          <button
            className="mr-4 sm:mr-8 text-sm xl:text-base text-cBlack"
            onClick={handleFilter}                                   // ✅ movido al button
          >
            <span>{!showFilters ? "Mostrar Filtros" : "Ocultar Filtros"}</span>
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

        {!loading && products.length === 0 && !error && (
          <div>No se encontraron productos</div>
        )}
      </div>
    </>
  );
};