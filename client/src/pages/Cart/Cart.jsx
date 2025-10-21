import { Link, useNavigate } from "react-router-dom"
//context
import { useCartContext } from "../../context/CartContext.jsx"
import { useAuthContext } from "../../context/AuthContext"
//components
import { ProdsInCart } from "../../components/ProdsInCart/ProdsInCart.jsx"
import { EmptyCart } from "../../components/EmptyCart/EmptyCart.jsx"

import useCartTotal from "../../hooks/useCartTotal.js"
import { formatCurrency } from "../../utils/formatCurrency.js"


// Cart Component - Totalmente Responsivo
export const Cart = () => {
    const { authUser } = useAuthContext()
    const { cart } = useCartContext()
    const { finishPurchase } = useCartContext()

    const totalPrice = useCartTotal(cart.products);
    const navigate = useNavigate();
    const handleNavigate = () => navigate(-1);

    if (!cart?.products?.length) {
        return <EmptyCart />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* HEADER MÓVIL */}
            <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center">
                        <span className="font-extrabold text-lightRed font-poppins tracking-tighter italic text-2xl sm:text-3xl">SW</span>
                        <span className="font-bold text-black font-poppins tracking-tight italic text-2xl sm:text-3xl">Autoparts</span>
                    </Link>
                    <h1 className="text-lg sm:text-xl font-montserrat font-medium text-gray-800">
                        Tu Carrito
                    </h1>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row min-h-screen lg:min-h-auto">
                {/* SECCIÓN PRINCIPAL - PRODUCTOS */}
                <div className="flex-1 lg:basis-[75%] bg-cWhite lg:border">
                    {/* HEADER DESKTOP */}
                    <div className="hidden lg:flex items-center text-cBlack mt-8 xl:mt-[70px] ml-8 xl:ml-[70px]">
                        <Link to="/" className="flex items-center">
                            <span className="font-extrabold text-lightRed font-poppins tracking-tighter italic text-5xl xl:text-[4.5rem]">SW</span>
                            <span className="font-bold text-cBlack font-poppins tracking-tight italic text-5xl xl:text-[4.5rem]">Parts</span>
                        </Link>
                        <h1 className="ml-16 xl:ml-[100px] text-xl xl:text-[1.7rem] font-montserrat">
                            Tu Carrito:
                        </h1>
                    </div>

                    {/* LISTA DE PRODUCTOS */}
                    <div className="px-4 py-6 lg:px-0 lg:py-0">
                        <ProdsInCart cartId={cart._id} prods={cart.products} />
                    </div>

                    {/* TOTAL */}
                    <div className="px-4 lg:px-14 py-6 lg:mt-16 border-t lg:border-0 lg:bg-transparent">
                        <div className="lg:h-28 lg:text-cBlack lg:relative">
                            <h3 className="text-lg sm:text-xl lg:text-[1.7rem] font-montserrat font-medium text-gray-800 lg:text-black">
                                Total de la reserva:
                                <span className="ml-2 text-lightRed font-bold">
                                    {formatCurrency(totalPrice)}
                                </span>
                            </h3>
                            <p className="text-sm lg:text-base italic text-gray-600 lg:text-black mt-2 lg:absolute lg:top-[50px]">
                                El carrito se vaciará en el plazo de 1 día en caso de no haber sido confirmada la reserva.
                            </p>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR - CONSULTA Y ACCIONES */}
                <div className="lg:basis-[25%] bg-[#EEEEEE] flex flex-col justify-between font-poppins order-first lg:order-last">
                    {/* SECCIÓN DE CONSULTA */}
                    <div className="p-4 lg:p-10 flex-1">
                        <h3 className="text-xl lg:text-2xl font-medium text-gray-800 mb-4">
                            Consultar
                        </h3>
                        <textarea
                            className="w-full h-32 lg:h-[50%] p-3 text-black rounded-lg resize-none 
                                      focus:outline-none transition-colors duration-200
                                     placeholder:text-gray-500"
                            placeholder="Envía cualquier consulta acerca de los productos"
                        />
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="p-4 lg:p-0 lg:mb-10 space-y-3">
                        <button
                            className="w-full text-sm bg-deepGray hover:bg-gray-700 text-white py-4 lg:py-5 px-4 
                                     font-medium transition-colors duration-200 rounded-lg lg:rounded-none
                                     focus:outline-none focus:ring-2 focus:ring-gray-500"
                            onClick={handleNavigate}
                        >
                            VOLVER
                        </button>
                        <button
                            className="w-full text-sm bg-lightRed hover:bg-deepRed text-white py-4 lg:py-5 px-4 
                                     font-medium transition-colors duration-200 rounded-lg lg:rounded-none
                                     focus:outline-none focus:ring-2 focus:ring-orange-500"
                            onClick={() => finishPurchase(authUser._id, cart, totalPrice)}
                        >
                            CONFIRMAR RESERVA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
