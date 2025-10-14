import axios from "axios";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useIsMobile } from "../../hooks/isMobile.js";      //hook para renderizar breakpoints
import { useAuthContext } from "../../context/AuthContext.jsx";
import Swal from 'sweetalert2';

import { formatCurrency } from "../../utils/formatCurrency.js";
import { getImage } from "../../utils/getImage.js"
import { API_URL } from "../../utils/api_url.js";

export const Product = ({ data, params }) => {
  const { codpro, desc_stock, rubro, subrub, proveed, desc_rubro, desc_subrub, desc_marca, imageUrl, precioimpre, destacado } = data;

  const { isAdmin, accepted } = useAuthContext()
  const isMobile = useIsMobile(1280);
  const componentRef = useRef(null)

  const [category, subcategory] = params;
  const [hover, setShowHover] = useState(false)

  const formatedPrice = formatCurrency(precioimpre);

  const handleUnHighlightProduct = async () => {
    try {
      const result = await Swal.fire({
        text: '¿Deseas quitar este producto de destacados?',
        showCancelButton: true,
        confirmButtonText: 'SÍ',
        confirmButtonColor: '#DC5F00',
        cancelButtonText: 'CANCELAR',
        cancelButtonColor: '#61677A',
      });

      if (result.isConfirmed) {
        const response = await axios.put(`${API_URL}/api/products/highlight/unHighlight-product/${codpro}`);
        console.log('Producto quitado de destacados:', response.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMouseEnter = () => setShowHover(true)
  const handleMouseLeave = () => setShowHover(false);

  return (
    <article
      ref={componentRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        w-full max-w-sm mx-auto
        min-h-[380px] sm:min-h-[420px] lg:min-h-[450px] xl:min-h-[480px]
        ${destacado ? "bg-orange text-cBlack" : "bg-cWhite"} 
        font-poppins rounded-xl relative cursor-pointer
        shadow-sm hover:shadow-lg 
        transition-all duration-300 ease-in-out
        transform hover:scale-[1.02]
        flex flex-col
      `}
      id="product"
    >
      {/* Badge de destacado */}
      {destacado && (
        <div className="absolute top-3 left-3 z-20">
          <span className="text-xs sm:text-sm font-bold tracking-tight 
                         bg-cBlack text-white py-1 px-2 rounded-md
                         shadow-sm">
            DESTACADO
          </span>
        </div>
      )}

      {/* Imagen del producto */}
      <div className="w-full h-48 sm:h-56 lg:h-60 xl:h-64 relative overflow-hidden rounded-t-xl flex-shrink-0">
        {!imageUrl && (
          <span
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center
                text-deepRed font-bold italic font-montserrat 
                text-sm sm:text-base lg:text-lg px-4">
            IMAGEN EN DESARROLLO
          </span>
        )}
        <img
          src={getImage(imageUrl)}
          alt={`Producto: ${desc_stock || codpro}`}
          className={`
            rounded-t-xl object-contain h-full w-full
            transition-opacity duration-300
            ${!imageUrl ? "opacity-30" : "opacity-100"}
          `}
          loading="lazy"
        />
      </div>

      {/* Información del producto */}
      <div className="flex flex-col flex-1 justify-between p-3 sm:p-4 pb-14 sm:pb-16">
        <div className="space-y-1 sm:space-y-2 flex-1">
          <div className="space-y-1 sm:space-y-2">
            {/* Código del producto */}
            <div className="text-xs sm:text-sm text-gray-600">
              <span>Código: </span>
              <span className="font-bold text-gray-800">{codpro}</span>
            </div>

            {/* Descripción principal */}
            <h3 className="text-sm sm:text-base lg:text-lg font-bold uppercase 
                       leading-tight line-clamp-2 text-gray-800">
              {desc_stock}
            </h3>

            {/* Rubro y marca */}
            <div className="text-xs sm:text-sm italic text-gray-600 line-clamp-1">
              <span>{desc_rubro}</span>
              {desc_marca && <span> - {desc_marca}</span>}
            </div>
          </div>

          {/* Precio */}
          {accepted && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-sm sm:text-base font-semibold text-gray-800">
                <span className="text-xs sm:text-sm text-gray-600">PRECIO: </span>
                <span className="text-deepRed">{formatedPrice} ARG</span>
              </div>
            </div>
          )}
        </div>

        {/* Overlay de hover para desktop */}
        {!isMobile && accepted && (
          <div
            className={`
            absolute inset-0 rounded-xl
            bg-gradient-to-t from-black/80 via-black/40 to-transparent
            flex flex-col justify-center items-center
            transition-all duration-300 ease-in-out
            ${hover ? "opacity-100 visible" : "opacity-0 invisible"}
          `}
          >
            <Link
              to={`/producto/detail/${codpro}?category=${category}&subCategory=${subcategory}`}
              className="py-2 px-6 mb-4
                     bg-white/90 hover:bg-white 
                     text-gray-800 font-medium
                     rounded-lg border border-white/20
                     transition-all duration-200
                     transform hover:scale-105
                     shadow-lg backdrop-blur-sm
                     text-sm sm:text-base"
              id="btn-see-prod"
            >
              Ver Repuesto
            </Link>

            {/* Botón admin para quitar de destacados */}
            {isAdmin && destacado && (
              <button
                className="py-2 px-4
                       bg-red-500/90 hover:bg-red-600 
                       text-white font-medium text-xs sm:text-sm
                       rounded-lg border border-red-400/20
                       transition-all duration-200
                       transform hover:scale-105
                       shadow-lg backdrop-blur-sm"
                onClick={handleUnHighlightProduct}
              >
                QUITAR DE DESTACADOS
              </button>
            )}
          </div>
        )}

        {/* Botón para móvil */}
        {accepted && (isMobile) && (
          <Link
            id="btn-see-prod"
            to={`/producto/detail/${codpro}?category=${category}&subCategory=${subcategory}`}
            className={`
            absolute bottom-3 left-3 right-3
            py-2 px-4 
            bg-lightRed hover:bg-red-600 
            text-white text-center font-medium
            rounded-lg transition-all duration-200
            text-xs sm:text-sm
            shadow-lg
            ${!isMobile && hover ? "opacity-0 invisible" : "opacity-100 visible"}
          `}
          >
            Ver Repuesto
          </Link>
        )}
      </div>
    </article>
  )
}