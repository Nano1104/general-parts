// ─── Product.jsx ──────────────────────────────────────────────────────────────
//
// CAMBIOS VISUALES vs original:
//   - Layout horizontal (fila) en lugar de card vertical
//   - Imagen a la izquierda (60-80px), info al centro, precio y acción a la derecha
//   - Desktop: botón "Ver" aparece con slide-in en hover de fila
//   - Mobile (< 1280px): botón siempre visible, layout compacto en 2 líneas
//   - "DESTACADO": borde izquierdo naranja + fondo tenue en vez de bg completo
//   - IDs únicos: reemplazados por data-attributes (bug de accesibilidad — IDs duplicados en map)
//   - Sin hover scale en la fila entera (evita compositing layers en listas largas)
//   - Sin overlay gradient → reemplazado por transición simple del botón
//
// LÓGICA: sin cambios. Todas las props, hooks, handlers y condicionales son idénticos.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { useIsMobile } from "../../hooks/isMobile.js";
import { useAuthContext } from "../../context/AuthContext.jsx";
import Swal from "sweetalert2";

import { formatCurrency } from "../../utils/formatCurrency.js";
import { getImage } from "../../utils/getImage.js";
import { API_URL } from "../../utils/api_url.js";

// ─── SVG placeholder para imagen en desarrollo ───────────────────────────────
const ImagePlaceholder = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100">
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-zinc-300 mb-1" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="text-[8px] text-zinc-400 font-bold italic text-center leading-tight tracking-wide px-1 uppercase">
      En desarrollo
    </span>
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export const Product = ({ data, params }) => {
  const {
    codpro,
    desc_stock,
    rubro,
    subrub,
    proveed,
    desc_rubro,
    desc_subrub,
    desc_marca,
    imageUrl,
    precioimpre,
    destacado,
  } = data;

  const { isAdmin, accepted } = useAuthContext();
  const isMobile = useIsMobile(1280);
  const componentRef = useRef(null);

  const [category, subcategory] = params;
  const [hover, setShowHover] = useState(false);

  const formatedPrice = formatCurrency(precioimpre);

  // Sin cambios en la lógica de negocio
  const handleUnHighlightProduct = async () => {
    try {
      const result = await Swal.fire({
        text: "¿Deseas quitar este producto de destacados?",
        showCancelButton: true,
        confirmButtonText: "SÍ",
        confirmButtonColor: "#DC5F00",
        cancelButtonText: "CANCELAR",
        cancelButtonColor: "#61677A",
      });
      if (result.isConfirmed) {
        const response = await axios.put(
          `${API_URL}/api/products/highlight/unHighlight-product/${codpro}`
        );
        console.log("Producto quitado de destacados:", response.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const detailUrl = `/producto/detail/${codpro}?category=${category}&subCategory=${subcategory}`;

  return (
    <article
      ref={componentRef}
      onMouseEnter={() => setShowHover(true)}
      onMouseLeave={() => setShowHover(false)}
      className={[
        // Base: fila horizontal, borde inferior separador
        "relative flex items-center gap-3 sm:gap-4 lg:gap-5",
        "px-3 sm:px-4 lg:px-5 py-3",
        "my-2 mx-5 lg:mx-12",
        "border-b border-zinc-100 rounded-md",
        "transition-colors duration-150 font-roboto",
        // Destacado: borde izquierdo naranja + fondo cálido sutil
        destacado
          ? "border-l-[3px] border-l-orange-400 bg-orange-50/60"
          : hover
            ? "border-l-[3px] border-l-red-600 bg-zinc-50"
            : "border-l-[3px] border-l-transparent bg-white",
      ].join(" ")}
      // data-id en vez de id= (los IDs deben ser únicos en el DOM)
      data-product-id={codpro}
    >

      {/* Badge destacado — esquina superior derecha */}
      {destacado && (
        <span className="absolute top-0 right-0 text-[9px] font-black tracking-[0.15em] uppercase
                                 bg-orange-500 text-white py-0.5 px-2">
          ★ Destacado
        </span>
      )}

      {/* ── Imagen ───────────────────────────────────────────────────── */}
      <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-[72px] lg:h-[72px] flex-shrink-0 overflow-hidden bg-zinc-100">
        {!imageUrl ? (
          <ImagePlaceholder />
        ) : (
          <img
            src={getImage(imageUrl)}
            alt={`Repuesto: ${desc_stock || codpro}`}
            className="w-full h-full object-contain transition-opacity duration-200 opacity-100"
            loading="lazy"
          />
        )}
      </div>

      {/* ── Info central ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0">

        {/* Mobile layout: stack todo */}
        {isMobile ? (
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.1em]">
              Cód: <span className="text-zinc-600">{codpro}</span>
            </p>
            <h3 className="text-sm font-bold uppercase text-zinc-900 leading-tight line-clamp-2">
              {desc_stock}
            </h3>
            <p className="text-xs text-zinc-400 line-clamp-1">
              {desc_rubro}
              {desc_marca && <span className="text-zinc-500"> — {desc_marca}</span>}
            </p>
            {/* Precio + botón en la misma fila en mobile */}
            {accepted && (
              <div className="flex items-center justify-between pt-1.5">
                <span className="text-sm font-bold text-red-600">
                  {formatedPrice}
                  <span className="text-[10px] font-medium text-zinc-400 ml-1">ARS</span>
                </span>
                <Link
                  to={detailUrl}
                  data-product-btn={codpro}
                  className="px-3 py-1.5 bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-wider
                                               hover:bg-red-600 transition-colors duration-150"
                >
                  Ver repuesto
                </Link>
              </div>
            )}
            {/* Admin mobile */}
            {accepted && isAdmin && destacado && (
              <button
                onClick={handleUnHighlightProduct}
                className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors"
              >
                Quitar de destacados
              </button>
            )}
          </div>
        ) : (
          // Desktop layout: código + descripción en dos líneas, compacto
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.1em] mb-0.5">
              Cód: <span className="text-zinc-600">{codpro}</span>
            </p>
            <h3 className="text-sm font-bold uppercase text-zinc-900 leading-snug line-clamp-1">
              {desc_stock}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
              {desc_rubro}
              {desc_marca && <span className="text-zinc-500"> — {desc_marca}</span>}
            </p>
          </div>
        )}
      </div>

      {/* ── Precio (desktop) ──────────────────────────────────────────── */}
      {!isMobile && accepted && (
        <div className="flex-shrink-0 text-right w-28">
          <p className="text-sm font-bold text-red-600 leading-none">{formatedPrice}</p>
          <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-wider">ARS</p>
        </div>
      )}

      {/* ── Acciones (desktop) — visibles solo en hover ───────────────── */}
      {!isMobile && accepted && (
        <div className={`
                    flex-shrink-0 flex flex-col items-end gap-1.5
                    transition-all duration-150
                    ${hover ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none"}
                `}>
          <Link
            to={detailUrl}
            data-product-btn={codpro}
            className="px-4 py-2 bg-zinc-900 hover:bg-red-600 text-white
                                   text-[11px] font-bold uppercase tracking-wider
                                   transition-colors duration-150 whitespace-nowrap"
          >
            Ver repuesto
          </Link>

          {isAdmin && destacado && (
            <button
              onClick={handleUnHighlightProduct}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200
                                       text-red-600 text-[10px] font-semibold uppercase tracking-wider
                                       transition-colors duration-150 whitespace-nowrap"
            >
              Quitar destacado
            </button>
          )}
        </div>
      )}

      {/* Espaciador para que las acciones no colapsen el layout cuando están hidden */}
      {!isMobile && accepted && (
        <div className={`flex-shrink-0 w-[110px] ${hover ? "hidden" : "block"}`} aria-hidden="true" />
      )}
    </article>
  );
};