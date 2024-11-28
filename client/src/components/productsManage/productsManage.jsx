import axios from "axios";
import Swal from 'sweetalert2';

import { API_URL } from "../../utils/api_url.js";

export const ProductsManage = () => {

    const handleChange = async (e) => {
        e.preventDefault();
        const prodId = e.target.prodId.value
        const newStock = e.target.stock.value

        const res = await axios.put(`${API_URL}/api/products/update-stock/${prodId}`, { newStock }, { withCredentials: true })
        console.log(res)
        if(res.status == 200) Swal.fire("Stock cambiado!");
    }

    return(
        <>
        <h2 className="text-2xl font-poppins font-bold mb-4">PRODUCTOS</h2>
        <div>
            <h3>VER PRODUCTOS</h3>
            <button className="bg-orange w-[15%] rounded-md py-1 text-gray font-medium font-poppins" type="submit">AGREGAR PRODUCTO</button>
        </div>
        <hr className="my-4 w-[20%]" />
        <div className="flex flex-col">
            <h3>MODIFICAR PRODUCTO</h3>
            <form action="" onSubmit={handleChange}>
                <input type="text" name="prodId" placeholder="Ingresar ID del producto" className="w-[25%] py-1 px-2 my-2" />
                <div>
                    <span className="font-medium">Stock:</span><input type="text" name="stock" className="w-[10%] py-1 px-2 my-2 ml-2" />
                </div>
                <button className="bg-orange w-[15%] rounded-md py-1 text-gray font-medium font-poppins" type="submit">MODIFICAR PRODUCTO</button>
            </form>
        </div>
        </>
    )
}