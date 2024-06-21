import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"


export const ProductDetail = ({prod}) => {
    const { codpro, desc_stock, rubro, subrub, proveed, desc_rubro, desc_marca, porcen1, precioimpre } = prod;
    const navigate = useNavigate();
    
    const handleNavigate= () => {
        navigate(-1);
    }

    return(
        <>
        <div className="h-[250px] w-[250px] rounded-md p-7 m-7 text-base text-center bg-lightGray" id="prod-detail-container">
            <h2 className="font-semibold uppercase">{desc_stock}</h2>
            <span className="italic">{rubro}</span>
            <span></span>
            <span>Proveedor: {proveed}</span>
            <span>Marca: {desc_marca}</span>
            <strong className="italic">Precio: {precioimpre}</strong>
            <br />
            <button className="py-2 px-4 m-4 text-center rounded-md bg-red text-white" onClick={handleNavigate}>Volver</button>
        </div>
        </>
    )
}