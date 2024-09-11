import { NavBar } from "../../components/NavBar/NavBar.jsx"
import { Logo } from "../../components/Logo/Logo.jsx"
import { Link } from "react-router-dom";

import bgImg from "../../images/bg-home.avif"
//icons
import { FaWhatsapp } from "react-icons/fa";

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
                <div className="flex flex-col text-white italic font-medium text-[1.4rem] mt-4">
                    <div>
                        <FaWhatsapp className="inline-block" /><span className="ml-2">1160487294</span>
                    </div>
                    <div>
                        <FaWhatsapp className="inline-block" /><span className="ml-2">1154327294</span>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}