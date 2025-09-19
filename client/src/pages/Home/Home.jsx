import { NavBar } from "../../components/NavBar/NavBar.jsx"
import { Logo } from "../../components/Logo/Logo.jsx"
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx";

//icons
import { FaWhatsapp } from "react-icons/fa";
import logo from "../../../public/vite.svg"

export const Home = () => {
    const { authUser } = useAuthContext()

    return (
        <>
            <div className="h-screen w-full relative overflow-hidden">
                <div className="bg-homeBg bg-cover brightness-[.4] blur-[2px] grayscale-[0.9] w-full h-[100vh]"></div>
                <NavBar />

                <div className="absolute top-[8%] flex flex-col lg:items-start lg:ml-20">
                    <Logo />
                    <span
                        className="text-white font-montserrat font-medium p-3
                                    text-justify lg:text-left
                                    text-2xl lg:text-3xl 2xl:text-6xl 2xl:w-3/6
                                    mt-14 lg:mt-0"
                    >
                        Venta de repuestos para automóviles de todas las marcas
                    </span>
                    {
                        authUser
                            ?
                            <Link
                                to="/productos"
                                className="border text-white bg-lightRed border-lightRed rounded-md lg:mt-16
                                            py-1 px-5 hover:bg-transparent hover:text-lightRed hover:font-semibold
                                            transition-colors duration-200 ease-in-out"
                            >
                                VER REPUESTOS
                            </Link>
                            :
                            <div className="font-montserrat w-full flex flex-col items-center lg:items-start gap-6 text-base lg:mt-16">
                                <Link
                                    to="/authPage/"
                                    className="border text-white bg-lightRed border-lightRed rounded-md
                                            py-1 px-5 hover:bg-transparent hover:text-lightRed
                                            transition-colors duration-200 ease-in-out"
                                >
                                    INICIAR SESIÓN
                                </Link>
                            </div>
                    }
                </div>

                <div className="text-white w-full font-montserrat font-semibold italic absolute bottom-0 flex items-center justify-between px-10 py-6">
                    <div className="flex items-center mx-auto text-2xl">
                        <div className="flex items-center">
                            <FaWhatsapp />
                            <span className="ml-2">11 5452-9682</span>
                        </div>
                        <span className="mx-2">-</span>
                        <div className="flex items-center">
                            <FaWhatsapp />
                            <span className="ml-2">11 6335-8220</span>
                        </div>
                    </div>

                    <FaWhatsapp className="cursor-pointer text-4xl lg:text-5xl bg-lightRed text-white rounded-full" />
                </div>

            </div>
        </>
    )
}
