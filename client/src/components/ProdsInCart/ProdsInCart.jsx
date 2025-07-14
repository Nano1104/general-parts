import { useCartContext } from "../../context/CartContext";
import { IoTrashOutline } from "react-icons/io5";

import { formatCurrency } from "../../utils/formatCurrency";

import bulonesImg from "../../images/bulones.png"
import sondaImg from "../../images/sondaVerde1.png"
import pasoApasoImg from "../../images/motor-pasoapaso.png"
import swpartsIcon from "/vite.svg"

const getImage = (subrubro) => {
    const subrub = subrubro?.toUpperCase() || "";

    if (subrub === "SONDA LAMBDAS") return sondaImg;
    if (subrub === "MOTOR PASO A PASO") return pasoApasoImg;
    if (subrub.includes("TORNILLOS")) return bulonesImg;

    return swpartsIcon;
};

export const ProdsInCart = ({cartId, prods}) => {
    console.log("🚀 ~ ProdsInCart ~ prods:", prods)
    const { handleDeleteProdFromCart } = useCartContext()
 
    return (
        prods.map(prod => (
            <div key={`prod-in-cart-${prod.product._id}`} className="flex justify-center items-center">
                <div
                className="flex w-[90%] rounded-lg justify-between items-center bg-lightGray px-5 py-3 gap-4 font-poppins my-4"
                >
                <div className="basis-[50%] flex items-center justify-around">
                    <div className="img w-10 h-10 mr-20">
                    <img src={getImage(prod.desc_subrub)} alt="prodImg" className="object-cover h-full" />
                    </div>
                    <p className="first-letter:uppercase">{prod.product.desc_stock}</p>
                </div>
                <div className="basis-[50%] flex items-center justify-between">
                    <span>
                    x<span className="font-bold">{prod.quantity}</span>
                    </span>
                    <span>{formatCurrency(prod.quantity * prod.product.precioimpre)}</span>
                </div>
                </div>
                <IoTrashOutline
                className="text-2xl text-white ml-5 cursor-pointer"
                onClick={() => handleDeleteProdFromCart(cartId, prod.product._id, prod.quantity)}
                />
            </div>
        ))
    )
}


//// NOTA: Encontrar manera de que el cart envie su Id a este componente
//// NOTA: Revisar la funcion "handleDeleteProdFromCart" para que elimine del carrito tanto de la database como del estado local
//// NOTA: Revisar el componente "Cart" para que recargue el estado del carrito luego de eliminar un producto
//// NOTA: Revisar el componente "Cart" para que recargue el estado del carrito luego de confirmar la reserva