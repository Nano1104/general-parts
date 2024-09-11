import { Link } from "react-router-dom"
//context
import { useAuthContext } from "../../context/AuthContext"
//components
import { ProdsInCart } from "../../components/ProdsInCart/ProdsInCart.jsx"
import { EmptyCart } from "../../components/EmptyCart/EmptyCart.jsx"
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
                cart.products.length > 0
                ?
                <>
                <div className="flex">
                    <div className="basis-[75%]">
                        <div className="flex items-center text-white mt-[70px] ml-[70px]">
                            <Link to="/" /* className="absolute top-0 my-7 ml-10" */>
                                <span className="font-extrabold text-orange font-poppins tracking-tighter italic text-[4.5rem]">SW</span>
                                <span className="font-bold text-white font-poppins tracking-tight italic text-[4.5rem]">Parts</span>
                            </Link>
                            <h3 className="ml-[100px] text-[1.7rem] font-montserrat">Tu Carrito:</h3>
                        </div>
                        <div className="">
                            <ProdsInCart cartId={cart._id} prods={cart.products} />
                        </div>
                    </div>
                    <div className="basis-[25%] bg-[#EEEEEE] h-[100vh]">
                        <h3>Consultar</h3>
                        <textarea className="text-white resize-none" name="" id="" placeholder="Envia cualquier consulta acerca de los productos"></textarea>
                        <button>CONFIRMAR RESERVA</button>
                    </div>
                </div>
                </>
                :
                <>
                <EmptyCart />
                </>
            }
        </>
    )
}