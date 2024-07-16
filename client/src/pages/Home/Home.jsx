import { NavBar } from "../../components/NavBar/NavBar.jsx"
import { Logo } from "../../components/Logo/Logo.jsx"
import { Link } from "react-router-dom";

import bgImg from "../../images/bg-home.avif"

import "./Home.css"

export const Home = () => {
    return(
        <>
        <div className="h-[100vh] w-full relative overflow-hidden">
            <img src={bgImg} alt="" id="bg-home" />
            <NavBar />

            <div className="absolute top-0 left-[5%]">
                <Logo />
                <div className="w-[30vw]">
                    <span className="text-white text-3xl font-roboto">Venta de repuestos para automóviles de todas las marcas</span>
                </div>
            </div>
        </div>
        </>
    )
}