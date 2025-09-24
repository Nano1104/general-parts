import { useCartContext } from "../../context/CartContext";
import { IoTrashOutline } from "react-icons/io5";

import { formatCurrency } from "../../utils/formatCurrency";
import { getImage } from "../../utils/getImage.js";


// ProdsInCart Component - Totalmente Responsivo
export const ProdsInCart = ({ cartId, prods }) => {
    const { handleDeleteProdFromCart } = useCartContext();

    return (
        <div className="space-y-4 lg:space-y-0">
            {prods.map(prod => (
                <div key={`prod-in-cart-${prod.product._id}`} className="lg:flex lg:justify-center lg:items-center">
                    <div className="flex w-full lg:w-[90%] rounded-lg justify-between items-center 
                                  bg-lightGray p-4 lg:px-5 lg:py-3 gap-3 lg:gap-4 font-poppins lg:my-4
                                  shadow-sm border border-gray-200 lg:shadow-none">
                        
                        {/* IMAGEN Y DESCRIPCIÓN */}
                        <div className="flex-1 lg:basis-[50%] flex items-center min-w-0">
                            <div className="flex-shrink-0 w-12 h-12 lg:w-10 lg:h-10 mr-3 lg:mr-20">
                                <img 
                                    src={getImage(prod.product.imageUrl)} 
                                    alt={`Producto ${prod.product.desc_stock}`}
                                    className="w-full h-full object-cover rounded" 
                                />
                            </div>
                            <p className="text-sm lg:text-base first-letter:uppercase truncate lg:truncate-none">
                                {prod.product.desc_stock}
                            </p>
                        </div>

                        {/* CANTIDAD, PRECIO Y ELIMINAR */}
                        <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
                            {/* CANTIDAD Y PRECIO */}
                            <div className="lg:basis-[50%] flex flex-col lg:flex-row items-end lg:items-center 
                                          justify-between text-right lg:text-left space-y-1 lg:space-y-0">
                                <span className="text-sm lg:text-base">
                                    x<span className="font-bold">{prod.quantity}</span>
                                </span>
                                <span className="text-sm lg:text-base font-medium text-lightRed lg:text-black">
                                    {formatCurrency(prod.quantity * prod.product.precioimpre)}
                                </span>
                            </div>

                            {/* BOTÓN ELIMINAR */}
                            <button
                                onClick={() => handleDeleteProdFromCart(cartId, prod.product._id, prod.quantity)}
                                className="p-2 hover:bg-red-50 rounded-full transition-colors duration-200 
                                         focus:outline-none focus:ring-2 focus:ring-red-500"
                                aria-label="Eliminar producto del carrito"
                            >
                                <IoTrashOutline className="text-xl lg:text-2xl text-red-600 hover:text-red-700" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};