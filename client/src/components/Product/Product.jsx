import { Link } from "react-router-dom";

import "./product.css"

export const Product = ({data, params}) => {
    const [category, subcategory] = params;
    const { codpro, desc_stock, rubro, subrub, proveed, desc_rubro, desc_marca, porcen1, precioimpre } = data;

    return(
        <>
        <div id="product" className="h-[490px] w-[450px] font-roboto bg-gray rounded-md relative my-3">
            <div className="w-full h-[65%]">
                <img src="#" alt="" className="rounded-t-xl" />
            </div>
            <div className="flex flex-col items-start px-4 mt-2 font-poppins">
                <h3 className="text-start uppercase font-bold mt-2 text-xl">{desc_stock}</h3>
                <span className="">{desc_rubro}</span>
            </div>
            <div className="product-div-hover">
                <Link to={`/producto/detail/${codpro}?category=${category}&subCategory=${subcategory}`}
                    className="py-2 px-4 text-center text-black rounded-2xl border font-poppins hover:bg-deepGray hover:text-gray transition duration-200"
                    id="btn-see-prod">
                    Ver Repuesto
                </Link>
            </div>
        </div>
        </>
    )
}