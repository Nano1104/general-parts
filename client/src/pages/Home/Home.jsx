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
            <div className="bg-homeBg bg-cover brightness-50 blur-[2px] grayscale-[0.8]" id="bg-home"></div>
            {/* <img src={bgImg} alt="" id="bg-home" className="hidden lg:block" /> */}
            <NavBar />

            <div className="h-screen absolute top-[10%] font-roboto border-white w-full blur-none flex flex-col items-center lg:items-start"> {/* large screen: absolute top-0 left-[5%] */}
                <Logo />
                <div className="text-center lg:text-left p-3 mt-20 lg:mt-0 lg:w-[50%] lg:ml-10 lg:text-xl">
                    <span className="text-white text-[1.7em]">Venta de repuestos para automóviles de todas las marcas</span>
                </div>
                <div className="flex gap-4 text-white italic font-medium mt-4 lg:ml-10 lg:text-xl">
                    <div className="flex items-center">
                        <FaWhatsapp className="" /><span className="ml-2">1160487294</span>
                    </div>
                    <span>-</span>
                    <div className="flex items-center">
                        <FaWhatsapp className="" /><span className="ml-2">1154327294</span>
                    </div>
                </div> 
                <Link to="/productos" className="font-bold font-montserrat text-lightGray [text-shadow:_0_2px_4px_rgb(0_0_0/_0.5)] mt-[3rem] text-3xl sm:text-4xl lg:mt-24 lg:mx-auto lg:block">
                    VER REPUESTOS
                </Link>
            </div>
        </div>
        </>
    )
}
