import { Link, useNavigate } from "react-router-dom"
//context
import { useCartContext } from "../../context/CartContext.jsx"
import { useAuthContext } from "../../context/AuthContext"
//components
import { ProdsInCart } from "../../components/ProdsInCart/ProdsInCart.jsx"
import { EmptyCart } from "../../components/EmptyCart/EmptyCart.jsx"

import useCartTotal from "../../hooks/useCartTotal.js"
import { formatCurrency } from "../../utils/formatCurrency.js"

export const Cart = () => {

    const { authUser } = useAuthContext()
    const { cart } = useCartContext()
    console.log("🚀 ~ Cart ~ cart:", cart)
    const { finishPurchase } = useCartContext()

    /* const cart = authUser?.cart || { products: [] }; */
    const totalPrice = useCartTotal(cart.products);

    const navigate = useNavigate();
    const handleNavigate = () => navigate(-1);

    if (!cart?.products?.length) {
        return <EmptyCart />;
    }

    return (
        <>
            <div className="flex">
                <div className="basis-[75%] border">
                    <div className="flex items-center text-white mt-[70px] ml-[70px]">
                        <Link to="/" /* className="absolute top-0 my-7 ml-10" */>
                            <span className="font-extrabold text-orange font-poppins tracking-tighter italic text-[4.5rem]">SW</span>
                            <span className="font-bold text-white font-poppins tracking-tight italic text-[4.5rem]">Parts</span>
                        </Link>
                        <h3 className="ml-[100px] text-[1.7rem] font-montserrat">Tu Carrito:</h3>
                    </div>
                    <div>
                        <ProdsInCart cartId={cart._id} prods={cart.products} />
                    </div>
                    <div className="ml-14 mt-16 h-28 text-cBlack relative">
                        <h3 className="text-[1.7rem] font-montserrat font-medium">Total de la reserva: <span className="ml-2">{formatCurrency(totalPrice)}</span></h3>
                        <span className="italic absolute top-[50px]">El carrito se vaciará en el plazo de 1 día en caso de no haber sido confirmada la reserva.</span>
                    </div>
                </div>
                <div className="basis-[25%] bg-[#EEEEEE] h-[100vh] flex flex-col justify-between font-poppins">
                    <div className="m-10 h-[50%]">
                        <h3 className="text-2xl">Consultar</h3>
                        <textarea className="mt-3 text-black p-2 w-full h-[50%] border-black resize-none focus:border-black" name="" id="" placeholder="Envia cualquier consulta acerca de los productos"></textarea>
                    </div>
                    <div className="mb-10 font-medium">
                        <button className="bg-deepGray w-full my-2 py-5 px-2" onClick={handleNavigate}>VOLVER</button>
                        <button className="bg-orange w-full my-2 py-5 px-2" onClick={() => finishPurchase(authUser._id, cart, totalPrice)}>CONFIRMAR RESERVA</button>
                    </div>
                </div>
            </div>
        </>
    )
}
