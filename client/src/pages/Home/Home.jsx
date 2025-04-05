import { NavBar } from "../../components/NavBar/NavBar.jsx"
import { Logo } from "../../components/Logo/Logo.jsx"
import { Link } from "react-router-dom";

//icons
import { FaWhatsapp } from "react-icons/fa";

export const Home = () => {
    return(
        <>
        <div className="h-[100vh] w-full relative overflow-hidden">
            <div className="bg-homeBg bg-cover brightness-50 blur-[2px] grayscale-[0.8] w-full h-[100vh]"></div>
            {/* <img src={bgImg} alt="" id="bg-home" className="hidden lg:block" /> */}
            <NavBar />

            <div className="h-screen absolute top-[10%] border-white w-full blur-none flex flex-col items-center lg:items-start">
                <Logo />
                <span className="text-white text-center lg:text-left text-2xl lg:text-3xl p-3 mt-14 lg:mt-0 lg:ml-8 font-montserrat font-bold">Venta de repuestos para automóviles de todas las marcas</span>
                <div className="flex gap-4 text-white italic mt-4 lg:ml-10 lg:text-xl font-montserrat font-bold">
                    <div className="flex items-center">
                        <FaWhatsapp /><span className="ml-2">11 5452-9682</span>
                    </div>
                    <span>-</span>
                    <div className="flex items-center">
                        <FaWhatsapp /><span className="ml-2">11 6335-8220</span>
                    </div>
                </div> 
                <Link to="/productos" className="font-roboto font-medium text-lightGray [text-shadow:_0_2px_4px_rgb(0_0_0/_0.5)] mt-[3rem] text-3xl sm:text-4xl lg:mt-24 lg:mx-auto lg:block">
                    VER REPUESTOS
                </Link>
            </div>

            <FaWhatsapp className="absolute cursor-pointer bottom-0 right-0 text-[3.5em] p-1 mr-8 mb-8 border bg-orange text-white rounded-full" />
        </div>
        </>
    )
}
