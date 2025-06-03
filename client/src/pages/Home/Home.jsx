import { NavBar } from "../../components/NavBar/NavBar.jsx"
import { Logo } from "../../components/Logo/Logo.jsx"
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx";

//icons
import { FaWhatsapp } from "react-icons/fa";

export const Home = () => {
    const { authUser } = useAuthContext()

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
                {
                    authUser 
                    ?
                    <Link to="/productos" className="font-roboto font-medium text-lightGray [text-shadow:_0_2px_4px_rgb(0_0_0/_0.5)] mt-[3rem] text-3xl sm:text-4xl lg:mt-24 lg:mx-auto lg:block">
                        Ver repuestos
                    </Link>
                    : 
                    <div className="w-full flex flex-col items-center gap-6 text-xl lg:mt-24 lg:mx-auto font-montserrat text-cBlack">
                        <Link to="/authPage/login" className="relative            
                                                    px-[7px] py-[3px]    
                                                    rounded-lg           
                                                    border            
                                                    border-white         
                                                    z-10              
                                                    text-white       
                                                    inline-flex       
                                                    justify-center   
                                                    items-center      
                                                    gap-[5px]     
                                                    transition-all  
                                                    duration-300   
                                                    hover:text-black 
                                                    hover:border-black 
                                                    before:content-['']
                                                    before:absolute
                                                    before:inset-0    
                                                    before:rounded-lg 
                                                    before:-z-10    
                                                    before:bg-[var(--lightGray)] 
                                                    before:transition-transform
                                                    before:duration-300
                                                    before:origin-left
                                                    before:scale-x-0
                                                    hover:before:scale-x-100
                                                    after:content-[''] 
                                                    after:border
                                                    after:border-white
                                                    after:rounded-full 
                                                    after:w-[10px]
                                                    after:h-[10px]
                                                    after:transition-colors
                                                    after:duration-300
                                                    hover:after:bg-[var(--cBlack)]
                                                    hover:after:border-transparent
                            ">
                            Iniciar Sesión
                        </Link>
                        <Link to="/authPage/register" className="relative            
                                                    px-[7px] py-[3px]    
                                                    rounded-lg           
                                                    border            
                                                    border-white         
                                                    z-10              
                                                    text-white       
                                                    inline-flex       
                                                    justify-center   
                                                    items-center      
                                                    gap-[5px]     
                                                    transition-all  
                                                    duration-300   
                                                    hover:text-black 
                                                    hover:border-black 
                                                    before:content-['']
                                                    before:absolute
                                                    before:inset-0    
                                                    before:rounded-lg 
                                                    before:-z-10    
                                                    before:bg-[var(--lightGray)] 
                                                    before:transition-transform
                                                    before:duration-300
                                                    before:origin-left
                                                    before:scale-x-0
                                                    hover:before:scale-x-100
                                                    after:content-[''] 
                                                    after:border
                                                    after:border-white
                                                    after:rounded-full 
                                                    after:w-[10px]
                                                    after:h-[10px]
                                                    after:transition-colors
                                                    after:duration-300
                                                    hover:after:bg-[var(--cBlack)]
                                                    hover:after:border-transparent
                            ">
                            Registrarse
                        </Link>
                    </div>
                }
            </div>

            <FaWhatsapp className="absolute cursor-pointer bottom-0 right-0 text-[3.5em] p-1 mr-8 mb-8 border bg-orange text-white rounded-full" />
        </div>
        </>
    )
}
