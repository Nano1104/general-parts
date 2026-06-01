// ─── ProductsContainer.jsx ────────────────────────────────────────────────────
//
// CAMBIOS VISUALES vs original:
//   - Inner products: de grid multicolumna a flex-col (filas horizontales)
//   - Añade header de tabla sticky (Producto / Precio / Acción) — solo desktop
//   - Breadcrumb rediseñado: más limpio, con separadores explícitos
//   - Botón "Filtros" rediseñado: consistente con el sistema de diseño general
//   - Mensajes de estado (loading, error, sin resultados) con mejor jerarquía
//   - Wrapper de la lista con borde superior/inferior visible para delimitar el área
//
// LÓGICA: sin cambios. Infinite scroll, observer, loadMore, hasMore, estados idénticos.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { Product } from "../Product/Product.jsx";
import { Filters } from "../Filters/Filters.jsx";
import { Loading } from "../Loading/Loading.jsx";
import { useProducts } from "../../hooks/useProducts.js";
import { BsFilterLeft } from "react-icons/bs";
import { MdKeyboardArrowRight } from "react-icons/md";
import "../../pages/ProductosPage/productospage.css";

// ─── Breadcrumb item ──────────────────────────────────────────────────────────
// Extraído para evitar repetición dentro del render
const BreadcrumbLink = ({ to, children, isLast = false }) => (
  <>
    <Link
      to={to}
      className={[
        "text-xs sm:text-sm font-semibold uppercase tracking-wide transition-colors duration-150 italic",
        isLast
          ? "text-zinc-900 pointer-events-none"
          : "text-zinc-500 hover:text-red-600",
      ].join(" ")}
    >
      {children}
    </Link>
    {!isLast && (
      <MdKeyboardArrowRight
        className="text-black flex-shrink-0"
        aria-hidden="true"
      />
    )}
  </>
);

// ─── Header de tabla (desktop) ────────────────────────────────────────────────
// Fila de encabezados que aparece encima del listado de productos.
// Solo visible en sm+. En mobile los datos están en las filas mismas.
const TableHeader = ({ hasPrice }) => (
  <div
    aria-hidden="true"
    className="hidden sm:grid items-center justify-between border border-lightRed
                   px-3 sm:px-4 lg:px-14 py-2
                   bg-zinc-950
                   grid-cols-[72px_1fr_auto_auto] font-montserrat"
    style={{ gridTemplateColumns: "1fr 1fr auto auto" }}
  >
    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
      Producto
    </span>
    {hasPrice && (
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 text-right w-28">
        Precio
      </span>
    )}
  </div>
);








// ─── Componente principal ─────────────────────────────────────────────────────
export const ProductsContainer = ({ searchValue, setSearchValue }) => {
  const { category, subcategory, categories } = useParams();
  const [brand, setBrand] = useState(null);
  const [price, setPrice] = useState([]);
  const [showFilters, setShowFilter] = useState(false);
  const observerTarget = useRef(null);

  const encodedSubcategory = subcategory ? encodeURIComponent(subcategory) : "";

  const handleFilter = () => setShowFilter(v => !v);

  // Sin cambios — hook que maneja paginación, cursor y estado
  const { products, loading, hasMore, error, loadMore } = useProducts({
    searchValue,
    category,
    subcategory,
    brand,
    price,
  });

  // Limpiar búsqueda al navegar — sin cambios
  useEffect(() => {
    if (category || subcategory) setSearchValue("");
  }, [category, subcategory]);

  // Infinite scroll — sin cambios. loadMore es estable por useCallback en el hook
  useEffect(() => {
    if (!observerTarget.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const { accepted } = useAuthContext();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Barra superior: breadcrumb + botón filtros ───────────────── */}
      <div className="w-full mx-auto">
        <div className="flex items-center justify-between gap-4 py-3 mt-5">

          {/* Breadcrumb */}
          <nav
            aria-label="Navegación de categorías"
            className="flex items-center gap-1.5 flex-wrap ml-1"
          >
            {category && (
              <BreadcrumbLink
                to={`/productos/${category}`}
                isLast={!subcategory && !categories}
              >
                {category}
              </BreadcrumbLink>
            )}
            {subcategory && (
              <BreadcrumbLink
                to={`/productos/${category}/${encodedSubcategory}`}
                isLast={!categories}
              >
                {subcategory}
              </BreadcrumbLink>
            )}
            {categories && (
              <BreadcrumbLink
                to={`/productos/${category}/${encodedSubcategory}`}
                isLast
              >
                {categories}
              </BreadcrumbLink>
            )}
          </nav>

          {/* Botón filtros */}
          <button
            onClick={handleFilter}
            className={[
              "flex items-center gap-1.5 mr-1 sm:mr-4",
              "px-3 py-1.5",
              "text-[11px] font-bold uppercase tracking-[0.12em]",
              "border transition-colors duration-150",
              showFilters
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-700 border-zinc-200 hover:border-zinc-800 hover:text-zinc-900",
            ].join(" ")}
          >
            <BsFilterLeft className="text-base" aria-hidden="true" />
            <span>{showFilters ? "Ocultar filtros" : "Filtros"}</span>
          </button>
        </div>
      </div>

      {/* ── Layout principal: [sidebar filtros] + [listado productos] ── */}
      <div
        id="products-container"
        className={[
          "grid grid-cols-1 w-full mt-6",
          showFilters
            ? "md:grid-cols-[280px_1fr] 2xl:grid-cols-[240px_1fr]"
            : "md:grid-cols-1",
        ].join(" ")}
      >
        {/* Sidebar de filtros — sin cambios estructurales */}
        {showFilters && (
          <div>
            <Filters filtered={{ setBrand, price, setPrice, setShowFilter }} />
          </div>
        )}

        {/* ── Área de productos: header + filas ──────────────────── */}
        <div className="flex flex-col">

          {/* Header tipo tabla — solo visible cuando hay productos */}
          {/* {products.length > 0 && (
            <TableHeader hasPrice={!!accepted} />
          )} */}

          {/* Listado de filas de productos */}
          <div className="flex flex-col">
            {products.map((prod, index) => (
              <Product
                key={`${prod._id}-${index}`}
                data={prod}
                params={[category, subcategory]}
                featured={false}
              />
            ))}
          </div>

          {/* Trigger de infinite scroll — sin cambios */}
          {hasMore && products.length > 0 && !loading && (
            <div ref={observerTarget} style={{ height: "20px" }} />
          )}

          {/* Loading */}
          {loading && (
            <div className="py-8 flex justify-center">
              <Loading />
            </div>
          )}

          {/* Error del servidor */}
          {error && (
            <div className="col-span-full flex items-center gap-2.5 mx-4 my-6 px-4 py-3 bg-red-50 border-l-2 border-red-500">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden="true" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Fin de resultados */}
          {!hasMore && !loading && products.length > 0 && (
            <div className="col-span-full py-8 text-center border-t border-zinc-100">
              <p className="text-xs text-zinc-400 uppercase tracking-[0.15em] font-semibold">
                Fin de resultados
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                {products.length} productos encontrados
              </p>
            </div>
          )}

          {/* Sin resultados */}
          {!loading && products.length === 0 && !error && (
            <div className="col-span-full py-16 flex flex-col items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-zinc-200" aria-hidden="true">
                <path d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                No se encontraron productos
              </p>
            </div>
          )}
        </div>

      </div>
    </>
  );
};