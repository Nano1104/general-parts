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
            <div className="h-[50%] text-lightGray mt-16 font-montserrat">
                <h1 className="text-6xl font-semibold tracking-tighter">Tu carrito se encuentra vacio!</h1>
                <div className="flex flex-col items-center mt-5">
                    <span className="block text-xl">Debes agregar productos antes de continuar con la compra</span>
                    <Link to="/productos" className="bg-orange w-[25%] rounded-md py-1 px-2 mt-2 text-cBlack font-semibold">Ver repuestos</Link>
                </div>
            </div>
        </div>
        </>
    )
}

/* absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 */