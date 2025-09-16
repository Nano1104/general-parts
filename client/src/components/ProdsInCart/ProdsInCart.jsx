import { useCartContext } from "../../context/CartContext";
import { IoTrashOutline } from "react-icons/io5";

import { formatCurrency } from "../../utils/formatCurrency";
import { getImage } from "../../utils/getImage.js";


export const ProdsInCart = ({ cartId, prods }) => {
    console.log("🚀 ~ ProdsInCart ~ prods:", prods)
    const { handleDeleteProdFromCart } = useCartContext()

    return (
        prods.map(prod => (
            <div key={`prod-in-cart-${prod.product._id}`} className="flex justify-center items-center">
                <div className="flex w-[90%] rounded-lg justify-between items-center bg-lightGray px-5 py-3 gap-4 font-poppins my-4">
                    <div className="basis-[50%] flex items-center">
                        <div className="img w-10 h-10">
                            <img src={getImage(prod.product.imageUrl)} alt="prodImg" className="object-cover h-full" />
                        </div>
                        <p className="first-letter:uppercase ml-20">{prod.product.desc_stock}</p>
                    </div>
                    <div className="basis-[50%] flex items-center justify-between">
                        <span>
                            x<span className="font-bold">{prod.quantity}</span>
                        </span>
                        <span>{formatCurrency(prod.quantity * prod.product.precioimpre)}</span>
                    </div>
                </div>
                <IoTrashOutline
                    className="text-2xl text-cBlack ml-5 cursor-pointer"
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