import { useCartContext } from "../../context/CartContext";
import { IoTrashOutline } from "react-icons/io5";

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
                                    className="flex w-[90%] rounded-lg justify-between items-center bg-lightGray px-5 py-3 gap-4 font-poppins my-4">
                                        <div className="basis-[50%] flex items-center justify-around">
                                            <div className="img w-10 h-10 mr-20">
                                                <img src={getImage(prod.desc_subrub)} alt="prodImg" className="object-cover h-full" />
                                            </div>
                                            <p className="first-letter:uppercase">{prod.product.desc_stock}</p>
                                        </div>
                                        <div className="basis-[50%] flex items-center justify-between">
                                            <span>x<span className="font-bold">{prod.quantity}</span> </span>
                                            <span>${prod.quantity * prod.product.precioimpre}ARS</span>
                                        </div>
                                    </div>
                                    <IoTrashOutline className="text-2xl text-white ml-5 cursor-pointer" onClick={() => handleDeleteProdFromCart(cartId, prod.product._id, prod.quantity)} />
                                </div>
                            </>
                        )
                    })
                }
            </div>
        </>
    )
}