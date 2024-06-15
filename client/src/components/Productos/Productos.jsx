import { Link } from "react-router-dom";

import { Producto } from "../Producto/Producto.jsx"

export const Productos = ({productos}) => {
    
    return(
        <>
            {
                productos.map(prod => <Producto producto={prod} />)
            }
        </>
    )
}