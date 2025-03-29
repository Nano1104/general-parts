import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useIsMobile } from "../../hooks/isMobile.js";      //hook para renderizar breakpoints

import imgProduct from "../../images/tornillos.png"

export const Product = ({data, params, featured}) => {
    const { codpro, desc_stock, rubro, subrub, proveed, desc_rubro, desc_marca, porcen1, precioimpre } = data;
    const isMobile = useIsMobile(1280); // Puedes cambiar el breakpoint si lo necesitas
    const componentRef = useRef(null)

    const [category, subcategory] = params;
    const [hover, setShowHover] = useState(false)

    const handleMouseEnter = () => setShowHover(true)

    const handleMouseLeave = () => setShowHover(false);

    return(
        <>
        <div ref={componentRef} onMouseEnter={() => handleMouseEnter()} key={`key_${codpro}`} id="product" className="w-[85%] h-[65vh] mobile:h-[60vh] lg:w-[19em] xl:w-[22em] 2xl:w-[25em] 2xl:h-[55vh] bg-gray font-poppins rounded-xl relative my-3">
            { featured ? <span className="absolute m-3 text-sm font-bold tracking-tight bg-orange py-0.5 px-1 rounded-md">DESTACADO</span> : <></> }
            <div className="w-full h-[65%]">
                <img src={imgProduct} alt="" className="rounded-t-xl object-contain h-full" />
            </div>
            <div className="flex flex-col text-xs mobile:text-sm 2xl:text-base items-start px-4">
                <div className="text-sm">
                  <span>Código producto: </span><span className="font-bold">{codpro}</span>
                </div>
                <h3 className="text-start uppercase font-bold mt-2">{desc_stock}</h3>
                <span className="italic">{desc_rubro}</span>
                <div className="mt-2">
                  <span>PRECIO: <span className="font-bold">{precioimpre} ARG</span></span>
                </div>
            </div>
            {
                !isMobile
                ?
                <div onMouseLeave={() => handleMouseLeave()} className={`border h-full absolute top-0 w-full rounded-xl flex justify-center items-center bg-custom-gradient ${ hover ? "block" : "hidden" }`}>
                    <Link to={`/producto/detail/${codpro}?category=${category}&subCategory=${subcategory}`}
                        className="py-2 px-4 text-center text-black rounded-2xl border hover:bg-deepGray hover:border-transparent hover:text-white transition duration-200"
                        id="btn-see-prod">
                        Ver Repuesto
                    </Link>
                </div>
                :
                <>
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