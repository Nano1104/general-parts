import { Link } from "react-router-dom";
import { IoCartOutline } from "react-icons/io5";
import { CiWarning } from "react-icons/ci";

export const EmptyCart = () => {
    return(
        <>
        <div className="w-full h-[100vh] flex flex-col items-center text-center">
            <div className="bg-gray w-full h-[50%] flex justify-center items-center">
                <div className="flex relative">
                    <IoCartOutline className="inline-block text-[17rem]" />
                    <CiWarning className="text-[8rem] text-orange absolute top-0 right-0 z-50" />
                </div>
            </div>
            <div className="h-[50%] text-lightGray">
                <h1 className="text-[4rem] font-semibold tracking-tighter font-montserrat">Tu carrito se encuentra vacio!</h1>
                <span className="block text-xl">Debes agregar productos antes de continuar con la compra</span>
                <Link to="/productos" className="mt-5">Ver repuestos</Link>
            </div>
        </div>
        </>
    )
}

/* absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 */