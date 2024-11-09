import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export const Product = ({data, params}) => {
    const [category, subcategory] = params;
    const [isMobile, setIsMobile] = useState(false);
    const [hover, setShowHover] = useState(false)
    const { codpro, desc_stock, rubro, subrub, proveed, desc_rubro, desc_marca, porcen1, precioimpre } = data;

    const handleMouseEnter = () => setShowHover(true)

    const handleMouseLeave = () => setShowHover(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1280);
        };

        handleResize(); // Ejecutar al cargar el componente
        window.addEventListener("resize", handleResize); // Escuchar cambios de tamaño

        return () => {
            window.removeEventListener("resize", handleResize); // Limpiar evento
        };
    }, [])

    return(
        <>
        <div onMouseEnter={() => handleMouseEnter()} key={`key_${codpro}`} id="product" className="w-[85%] h-[65vh] mobile:h-[60vh] lg:w-[19em] xl:w-[22em] 2xl:w-[25em] 2xl:h-[55vh] font-roboto bg-gray rounded-xl relative my-3">
            <div className="w-full h-[65%]">
                <img src="#" alt="" className="rounded-t-xl" />
            </div>
            <div className="flex flex-col text-xs mobile:text-sm 2xl:text-base items-start px-4 font-poppins">
                <h3 className="text-start uppercase font-bold mt-2">{desc_stock}</h3>
                <span className="">{desc_rubro}</span>
            </div>
            {
                !isMobile
                ?
                <div onMouseLeave={() => handleMouseLeave()} className={`border h-full absolute top-0 w-full rounded-xl flex justify-center items-center bg-custom-gradient ${ hover ? "block" : "hidden" }`}>
                    <Link to={`/producto/detail/${codpro}?category=${category}&subCategory=${subcategory}`}
                        className="py-2 px-4 text-center text-black rounded-2xl border font-poppins hover:bg-deepGray hover:border-transparent hover:text-white transition duration-200"
                        id="btn-see-prod">
                        Ver Repuesto
                    </Link>
                </div>
                :
                <>
                <Link id="btn-see-prod" to={`/producto/detail/${codpro}?category=${category}&subCategory=${subcategory}`}
                    className="py-2 px-4 text-xs flex justify-center bg-deepGray text-white text-center font-poppins absolute w-full bottom-[10px]"
                >
                    Ver Repuesto
                </Link>
                </>
            }
        </div>
        </>
    )
}