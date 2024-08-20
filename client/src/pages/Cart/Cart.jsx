import { Link } from "react-router-dom"
//context
import { useAuthContext } from "../../context/AuthContext"
//icons
import { IoCartOutline } from "react-icons/io5";
import { CiWarning } from "react-icons/ci";

export const Cart = () => {
    const { authUser } = useAuthContext()
    const { cart } = authUser
    console.log("🚀 ~ Cart ~ cart:", cart)

    return(
        <>
            {
                cart.products.length <= 0
                ?
                <>
                <div className="w-[90%] h-[95vh] bg-deepGray
                absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-3xl text-center">
                    <div className="bg-lightGray w-full h-[40%] flex justify-center items-center rounded-tl-3xl rounded-tr-3xl">
                        <div className="flex relative">
                            <IoCartOutline className="inline-block text-[14rem]" />
                            <CiWarning className="text-[8rem] text-red absolute top-0 right-0 z-50" />
                        </div>
                    </div>
                    <div className="h-[60%]">
                        <h1 className="text-[4rem] font-semibold tracking-tighter font-montserrat">Tu carrito se encuentra vacio!</h1>
                        <span className="block text-xl">Debes agregar productos antes de continuar con la compra</span>
                        <Link to="/productos" className="mt-5">Ver repuestos</Link>
                    </div>
                </div>
                </>
                :
                <></>
            }
        </>
    )
}