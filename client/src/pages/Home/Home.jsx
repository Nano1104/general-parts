import { NavBar } from "../../components/NavBar/NavBar.jsx"
import { Logo } from "../../components/Logo/Logo.jsx"
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx";

//icons
import { FaWhatsapp } from "react-icons/fa";

// Home Component - Totalmente Responsivo y Optimizado
export const Home = () => {
    const { authUser } = useAuthContext()

    return (
        <div className="min-h-screen w-full relative overflow-hidden">
            {/* Background con mejor optimización */}
            <div className="hidden lg:block bg-homeBg bg-cover bg-center grayscale-[100%] w-full h-full absolute inset-0"></div>

            <NavBar />

            {/* Contenido principal con mejor distribución */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Contenido central */}
                <main className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 pt-16 sm:pt-20 lg:pt-0">
                    <div className="max-w-4xl">
                        <Logo />

                        {/* Texto principal optimizado */}
                        <h1 className="text-cBlack lg:text-white font-montserrat font-medium 
                                     text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-6xl
                                     text-center lg:text-left
                                     mt-6 sm:mt-8 lg:mt-12 2xl:mt-16
                                     max-w-none lg:max-w-4xl 2xl:max-w-5xl">
                            Venta de repuestos para automóviles de todas las marcas
                        </h1>

                        {/* Botones de acción */}
                        <div className="mt-8 sm:mt-10 lg:mt-16 flex justify-center lg:justify-start">
                            {authUser ? (
                                <Link
                                    to="/productos"
                                    className="inline-block border text-white bg-lightRed border-lightRed rounded-md
                                             py-2 px-6 sm:py-3 sm:px-8 
                                             hover:bg-transparent hover:text-lightRed hover:font-semibold
                                             transition-colors duration-200 ease-in-out
                                             font-montserrat font-medium text-sm sm:text-base"
                                >
                                    VER REPUESTOS
                                </Link>
                            ) : (
                                <Link
                                    to="/authPage/"
                                    className="inline-block border text-white bg-lightRed border-lightRed rounded-md
                                             py-2 px-6 sm:py-3 sm:px-8
                                             hover:bg-transparent hover:text-lightRed hover:font-semibold
                                             transition-colors duration-200 ease-in-out
                                             font-montserrat font-medium text-xs 2xl:text-sm"
                                >
                                    INICIAR SESIÓN
                                </Link>
                            )}
                        </div>
                    </div>
                </main>

                {/* Footer con contactos */}
                <footer className="relative z-10 text-cBlack lg:text-lightRed w-full font-montserrat font-semibold 
                                 bg-gradient-to-t from-black/20 to-transparent
                                 px-4 sm:px-6 lg:px-10 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-center">
                        {/* Números de WhatsApp */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm sm:text-base lg:text-xl">
                            <div className="flex items-center gap-2">
                                <FaWhatsapp className="" />
                                <span>11 5452-9682</span>
                            </div>
                            <span className="hidden sm:inline text-gray-300">-</span>
                            <div className="flex items-center gap-2">
                                <FaWhatsapp className="" />
                                <span>11 6335-8220</span>
                            </div>
                        </div>

                        {/* Botón WhatsApp flotante */}
                        {/* <button
                            className="flex items-center justify-center
                                     bg-lightRed hover:bg-red-600 
                                     text-white rounded-full
                                     w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
                                     transition-colors duration-200 ease-in-out
                                     shadow-lg hover:shadow-xl"
                            aria-label="Contactar por WhatsApp"
                        >
                            <FaWhatsapp className="text-xl sm:text-2xl lg:text-3xl" />
                        </button> */}
                    </div>
                </footer>
            </div>
        </div>
    )
}
