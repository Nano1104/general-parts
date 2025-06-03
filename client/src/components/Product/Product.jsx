import axios from "axios";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useIsMobile } from "../../hooks/isMobile.js";      //hook para renderizar breakpoints
import { useAuthContext } from "../../context/AuthContext.jsx";
import Swal from 'sweetalert2';

//images
import bulonesImg from "../../images/bulones.png"
import sondaImg from "../../images/sondaVerde1.png"
import pasoApasoImg from "../../images/motor-pasoapaso.png"
import swpartsIcon from "../../../public/vite.svg"

import { API_URL } from "../../utils/api_url.js";

export const Product = ({data, params}) => {
    const { codpro, desc_stock, rubro, subrub, proveed, desc_rubro, desc_subrub, desc_marca, porcen1, precioimpre, destacado } = data;
    const isMobile = useIsMobile(1280); // Puedes cambiar el breakpoint si lo necesitas
    const componentRef = useRef(null)
    const { isAdmin } = useAuthContext()

    const [category, subcategory] = params;
    const [hover, setShowHover] = useState(false)
    
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

    const getImage = () => {
      const subrub = desc_subrub?.toUpperCase() || "";

      if (subrub === "SONDA LAMBDAS") return sondaImg;
      if (subrub === "MOTOR PASO A PASO") return pasoApasoImg;
      if (subrub.includes("TORNILLOS")) return bulonesImg;

      return swpartsIcon;
    };

    const handleMouseEnter = () => setShowHover(true)

    const handleMouseLeave = () => setShowHover(false);

    return(
        <>
        <div ref={componentRef} onMouseEnter={() => handleMouseEnter()} key={`key_${codpro}`}
            className={`w-[85%] h-[65vh] mobile:h-[60vh] lg:w-[19em] xl:w-[22em] 2xl:w-[25em] 2xl:h-[55vh] ${destacado ? "bg-orange text-cBlack border border-white" : "bg-gray"} font-poppins rounded-xl relative my-3`}
            id="product">
            { destacado ? <span className="absolute m-3 text-sm font-bold tracking-tight bg-cBlack text-white py-0.5 px-2 rounded-md">DESTACADO</span> : <></> }

            <div className="w-full h-[65%] relative">
              {getImage() === swpartsIcon && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10 text-red font-bold italic font-montserrat text-xl">IMAGEN EN DESARROLLO</span>
              )}
              <img src={getImage()} alt={`img ilustrativa del producto: ${codpro}`} className={`rounded-t-xl object-contain ${getImage() === swpartsIcon ? "opacity-50" : ""} h-full w-full`}
              />
            </div>

            <div className="flex flex-col text-xs mobile:text-sm 2xl:text-base items-start px-4">
                <div className="text-sm">
                  <span>Código producto: </span><span className="font-bold">{codpro}</span>
                </div>
                <h3 className="text-start uppercase font-bold mt-2">{desc_stock}</h3>
                <div className="italic text-sm">
                    <span>{desc_rubro} </span><span>- {desc_marca}</span>
                </div>
                <div className="mt-2">
                  <span>PRECIO: <span className="font-bold">{precioimpre} ARG</span></span>
                </div>
            </div>
            
            {       
                !isMobile
                ?
                <div onMouseLeave={() => handleMouseLeave()} className={`border h-full absolute top-0 w-full rounded-xl flex flex-col justify-center items-center bg-custom-gradient ${ hover ? "block" : "hidden" }`}>
                    <Link to={`/producto/detail/${codpro}?category=${category}&subCategory=${subcategory}`}
                        className="py-2 px-4 text-center text-black rounded-2xl border hover:bg-deepGray hover:border-transparent hover:text-white transition duration-200"
                        id="btn-see-prod">
                        Ver Repuesto
                    </Link>
                    
                    { isAdmin && destacado
                        ? <button className="p-2 mt-4 text-sm text-center text-black rounded-xl border hover:bg-deepGray hover:border-transparent hover:text-white transition duration-200"
                                    onClick={handleUnHighlightProduct}>
                            QUITAR PRODUCTO DE DESTACADOS
                        </button>
                        : <></>
                    }
                </div>
                :
                <>      {/* RESOLUCION MOBILE DEL HOVER */}
                <Link id="btn-see-prod" to={`/producto/detail/${codpro}?category=${category}&subCategory=${subcategory}`}
                    className="py-2 px-4 text-xs flex justify-center bg-deepGray text-white text-center absolute w-full bottom-[10px]"
                >
                    Ver Repuesto
                </Link>
                </>
            }
        </div>
        </>
    )
}