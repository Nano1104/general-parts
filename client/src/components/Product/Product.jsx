import { Link } from "react-router-dom";

export const Product = ({data}) => {
    const { codpro, desc_stock, rubro, subrub, proveed, desc_rubro, desc_marca, porcen1, precioimpre } = data;

    return(
        <>
        <div className="flex flex-col gap-2 justify-center items-center border border-gray p-6 h-[300px] w-[300px] font-roboto">
            <div className="w-[150px] h-[150px] bg-slate-500 rounded-md flex justify-center items-center text-gray">Img</div>
            <h3>{desc_stock}</h3>
            <span>{desc_rubro}</span>
            <Link to={`/producto/detail/${codpro}`} className="bg-gray py-2 px-4 text-center text-white rounded-md" id="btn-see-prod">Ver Artículo</Link>
        </div>
        </>
    )
}