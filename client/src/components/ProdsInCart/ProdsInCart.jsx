import { useCartContext } from "../../context/CartContext";
import { IoTrashOutline } from "react-icons/io5";

export const ProdsInCart = ({cartId, prods}) => {
    const { handleDeleteProdFromCart } = useCartContext()
 
    return(
        <>
            <div key={`cartContainer-${cartId}`} className="">
                {
                    prods.map(prod => {
                        return(
                            <>
                                <div className="flex justify-center items-center">
                                    <div
                                    key={prod.product.codpro}
                                    className="flex w-[90%] rounded-lg justify-between items-center bg-lightGray px-5 py-3 gap-4 font-poppins">
                                        <div className="img w-10 h-10 border"></div>
                                        <p className="first-letter:uppercase">{prod.product.desc_stock}</p>
                                        <span>x<span className="font-bold">{prod.quantity}</span> </span>
                                        <span>${prod.quantity * prod.product.precioimpre}ARS</span>
                                    </div>
                                    <IoTrashOutline className="text-2xl text-white ml-5 cursor-pointer" onClick={() => handleDeleteProdFromCart(cartId, prod.product._id)} />
                                </div>
                            </>
                        )
                    })
                }
            </div>
        </>
    )
}