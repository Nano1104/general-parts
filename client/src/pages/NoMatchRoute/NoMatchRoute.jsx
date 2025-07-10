import { Link } from "react-router-dom"

export const NoMatchRoute = () => {
    return(
        <div className="border h-screen bg-lightGray text-cBlack w-full flex flex-col justify-center items-center text-center font-montserrat">
            <h1 className="text-8xl font-semibold">404!</h1>
            <h2 className="text-2xl">Ruta no encontrada</h2>
            <p className="text-lg">La página que estás buscando no existe o ha sido movida.</p>
            <Link to="/" className="bg-orange w-40 rounded-md py-1 px-2 mt-2 text-cBlack font-semibold">VOLVER</Link>
        </div>
    )
}