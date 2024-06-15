import { NavBar } from "../../components/NavBar/NavBar.jsx"
import { Link } from "react-router-dom";

export const Home = () => {
    return(
        <>
        <div className="h-[100vh]">
            <NavBar />
            <div id="svg-header" className="z-10"></div>
            <div className="flex flex-col gap-4 absolute top-[25vh] left-[40vw] items-center">
                <h1 className="text-7xl text-red font-semibold" id="title-home">General Parts</h1>
                <Link to="/productos" className="text-3xl text-gray font-montserrat hover:scale-110 transtion">Ver Inventario</Link>
            </div>
        </div>
        </>
    )
}