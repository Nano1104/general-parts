import axios from "axios";
import Swal from 'sweetalert2';

import { API_URL } from "../../utils/api_url.js";

export const ProductsManage = () => {

    /* const handleAddProduct = async () => {

    } */

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
        <div className="px-5 h-full flex overflow-auto pb-10">
            <div className="basis-[50%]">
                <h2 className="text-4xl font-montserrat tracking-tight font-bold mb-4">PRODUCTOS</h2>
                <div>
                    <h3 className="font-semibold">VER PRODUCTOS</h3>
                    <button className="bg-orange w-[30%] rounded-md py-1 text-sm text-lightGray font-medium font-poppins" type="submit">Ver lista de productos</button>
                </div>
                <hr className="my-4 w-[45%] ml-2" />
                <div>
                    <h3 className="font-semibold">AGREGAR PRODUCTO</h3>       {/*  //AGREGAR PRODUCTO */}
                    <form action="" className="flex flex-col text-sm">
                        <div>
                            <label className="font-medium">Cargar imagen:</label><input type="file" accept="image/*" className="w-[30%] rounded-md py-1 px-2 my-1 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Codigo de producto:</label><input type="text" className="w-[30%] rounded-md py-1 px-2 my-1 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Codigo proveedor:</label><input type="text" className="w-[30%] rounded-md py-1 px-2 my-1 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Descripcion:</label><input type="text" className="w-[30%] rounded-md py-1 px-2 my-1 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Rubro:</label><input type="text" className="w-[30%] rounded-md py-1 px-2 my-1 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Subrubro:</label><input type="text" className="w-[30%] rounded-md py-1 px-2 my-1 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Descripcion rubro:</label><input type="text" className="w-[30%] rounded-md py-1 px-2 my-1 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Descripcion subrubro:</label><input type="text" className="w-[30%] rounded-md py-1 px-2 my-1 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Precio:</label><input type="text" className="w-[30%] rounded-md py-1 px-2 my-1 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Porcentaje impuesto:</label><input type="text" className="w-[30%] rounded-md py-1 px-2 my-1 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Stock:</label><input type="text" className="w-[30%] rounded-md py-1 px-2 my-1 ml-2" />
                        </div>
                    </form>
                    <button className="bg-orange w-[30%] rounded-md py-1 text-sm text-lightGray font-medium font-poppins mt-1" type="submit">Agregar producto</button>
                </div>
                <hr className="my-4 w-[45%] ml-2" />
                <div className="flex flex-col">
                    <h3 className="font-semibold">MODIFICAR PRODUCTO</h3>
                    <form action="" onSubmit={handleChange} className="text-sm">
                        <input type="text" name="prodId" placeholder="Ingresar ID del producto" className="w-[30%] rounded-md py-1 px-2 my-2" />
                        <div>
                            <span className="font-medium">Stock:</span><input type="text" name="prodId" placeholder="Ingresar nuevo stock" className="w-[23%] ml-2 rounded-md py-1 px-2 my-2" />
                        </div>
                        <button className="bg-orange w-[30%] rounded-md py-1 text-sm text-lightGray font-medium font-poppins" type="submit">Modificar producto</button>
                    </form>
                </div>

            </div>
            

            <div className="basis-[50%] overflow-y-auto border-l">
                {/* <div>
                    {
                        users.map(user => <User userData={user} />)
                    }
                </div> */}
            </div>
        </div>
        </>
    )
}