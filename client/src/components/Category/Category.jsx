import { Link } from "react-router-dom";

export const Category = ({category}) => {

    return(
        <>
            <Link className="p-2 ml-2 font-montserrat hover:bg-red hover:cursor-pointer hover:text-white" to={`/productos/category/${category}`} >{category}</Link>
        </>
    )
}