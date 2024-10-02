import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom"
import Swal from 'sweetalert2';
//context
import { useAuthContext } from "../../context/AuthContext.jsx"
import { useCartContext } from "../../context/CartContext.jsx";
//components
import bgImg from "../../images/bg-contact.avif"
import { renderToString } from 'react-dom/server';
import { IoCartOutline } from "react-icons/io5";
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoMdHeartEmpty } from "react-icons/io";
import { ItemCount } from "../ItemCount/ItemCount.jsx"
import { Loading } from "../Loading/Loading.jsx";
//icons
import { FaPencil } from "react-icons/fa6";


const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

export const ProductDetail = ({prod}) => {
    const { _id, codpro, desc_stock, rubro, subrub, proveed, desc_rubro, desc_subrubro, desc_marca, porcen1, precioimpre, stock } = prod;
    const { authUser } = useAuthContext();
    const { addProductToCart } = useCartContext();
    const { id } = useParams();

    const [quantity, setQuantity] = useState(stock);
    const [amount, setAmount] = useState(0);
    const [prodDetails, setProdDetails] = useState(`Lorem ipsum dolor sit, amet consectetur adipisicing elit. Modi temporibus expedita reprehenderit consequuntur velit aperiam dolores?
                                                    Delectus non illo quisquam, quia quis veritatis optio quibusdam facere fugiat blanditiis vitae reprehenderit!`)

    const encodedCategory = desc_rubro ? desc_rubro.toLowerCase() : "";
    const encodedSubcategory = desc_subrubro ? encodeURIComponent(desc_subrubro).toLowerCase() : "";

    const handleChangeDetails = () => {

    }

    const handleAddToCart = () => {
        if(!authUser) {
            Swal.fire({
                html:   `
                            <span style="font-weight: 400">Necesitas iniciar sesión para agregar al carrito!</span><br />
                            <a href="http://localhost:5173/authPage" class="font-bold text-orange underline rounded-lg">INICIAR SESIÓN</a>
                        `,
                showConfirmButton: false,
                allowOutsideClick: true,
                allowEscapeKey: true,     
                backdrop: true  
              });
        } else {
            /* const cartId = authUser.cart ? authUser.cart._id : null;
            console.log(authUser.cart); */
            addProductToCart(_id, authUser.cart._id || null, amount)
        }
    }

    return(
        <>
        <div id="prod-detail-container"
        className="h-[90vh] w-[75%] py-[50px] px-[65px] text-base text-center bg-[#EEEEEE] font-poppins flex m-auto mt-10 rounded-xl relative"
        >
            <div className="img-prod-detail basis-[58%] border-r-4">
                <div className=""></div>
                {/* <img src="#" alt={`prod-${codpro}-img`} /> */}
            </div>
            <div id="labels-prod-detail" className="basis-[42%] mt-10 text-base">
                <div className="anchors flex justify-start items-center ml-10 italic absolute top-[25px] left-0 font-semibold">
                    <Link className="first-letter:uppercase" to={`/productos/${encodedCategory}`}>{desc_rubro}</Link><MdKeyboardArrowRight />
                    <Link className="first-letter:uppercase" to={`/productos/${encodedCategory}/${encodedSubcategory}`}>{desc_subrubro}</Link><MdKeyboardArrowRight />
                    <span className="cursor-pointer">{id}</span>
                </div>
                <h1 className="uppercase font-poppins font-bold text-3xl px-2 ml-[35px]">{desc_stock}</h1>
                <hr className="w-[50%] mt-5 border border-5 mx-auto" />
                <div className="flex items-start flex-col p-10">
                    <div className="flex flex-col mt-10 items-start gap-2">
                        <span className="font-medium">Proveedor: <span className="font-semibold">{proveed}</span></span>
                        <span className="font-medium">Marca: <span className="font-semibold">{desc_marca}</span></span>
                        <span className="font-medium">Stock: <span className="italic text-red">{quantity ? quantity : "No Disponible!"}</span></span>
                        <span className="text-3xl">${precioimpre}</span>
                    </div>
                    <div className="flex flex-col items-start mt-2">
                        <span className="font-semibold ml-1">Cantidad.</span>
                        <ItemCount handleQuantity={{ quantity, amount, setAmount }} />
                    </div>
                    <div className="flex justify-center mt-4 gap-2">
                        <button className="rounded-md py-2 px-4 bg-orange text-black flex justify-center items-center gap-1" onClick={handleAddToCart}>
                            <IoCartOutline className="inline-block text-xl" />Agregar
                        </button>
                        <button className="rounded-md py-2 px-4 bg-deepGray text-white flex justify-center items-center gap-1">
                            <IoMdHeartEmpty className="inline-block text-xl" />Favoritos
                        </button>
                    </div>
                    {/* <hr className="w-[50%] mt-5 border border-5 mx-auto" /> */}
                    <div className="text-left">
                        <div className="flex justify-between items-end">
                            <h2 className="font-semibold mt-16 text-3xl">DESCRIPCIÓN</h2>
                            { authUser && authUser.role === "admin" ? <FaPencil className="text-2xl mr-6 mb-1" /> : <></> }
                            
                        </div>
                        <div className="mt-4 h-[17vh] overflow-auto">
                            {prodDetails}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}