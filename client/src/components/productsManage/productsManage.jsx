import axios from "axios";
import Swal from 'sweetalert2';

import { API_URL } from "../../utils/api_url.js";
import { useState } from "react";

export const ProductsManage = () => {
    const [file, setFile] = useState(null)

    /* FUNCION PARA CARGA DE EXCEL */
    const handleUpdateExcel = async (e) => {
        e.preventDefault();
        
        // Mostrar loading
        Swal.fire({
            title: "Procesando Excel...",
            html: "Por favor espera, esto puede tomar unos momentos.",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading(); // Muestra el spinner
            }
        });
    
        try {
            const rubroValue = e.target.rubro.value.toUpperCase();
            const formData = new FormData();
            formData.append('excelFile', file);
            formData.append('rubro', rubroValue);
    
            const response = await axios.post(`${API_URL}/api/products/upload-excel`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
    
            // Cerrar loading y mostrar resultados
            Swal.close();
    
            const data = response.data;
            let mensaje = `Se agregaron ${data.details.nuevosInsertados} productos nuevos <br>
                          Se actualizaron ${data.details.actualizados} productos`;
    
            if (data.details.nuevosInsertados === 0 && data.details.actualizados === 0) {
                mensaje = "No se realizaron cambios. Verifica el archivo Excel.";
            }
    
            Swal.fire({
                html: mensaje,
                icon: "info",
                confirmButtonColor: "#DC5F00"
            });
    
        } catch (err) {
            Swal.close(); // Cierra el loading en caso de error
            Swal.fire({
                title: "Error",
                text: "No se pudo cargar el archivo. Intenta nuevamente.",
                icon: "error"
            });
            console.error("Error al cargar el Excel:", err);
        }
    };

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
                {/***************** CARGAR LISTA DE PRODUCTOS *****************/}
                <form method="POST" className="flex flex-col" onSubmit={handleUpdateExcel}>
                    <h3 className="font-semibold">CARGAR LISTA DE PRODUCTOS</h3>
                    <div className="text-sm">
                        <span className="font-medium">Nombre de rubro:</span><input type="text" name="rubro" placeholder="Rubro" required className="w-[23%] ml-2 rounded-md py-1 px-2 my-2" />
                    </div>
                    <input 
                            className="w-[50%]"
                            type="file" 
                            name="excelFile"
                            required
                            accept=".xlsx, .xls" 
                            onChange={(e) => setFile(e.target.files[0])} 
                    />
                    <button className="bg-orange w-[25%] rounded-md py-1 mt-2 text-sm text-lightGray font-medium font-poppins" type="submit">CARGAR LISTA</button>
                </form>
                <hr className="my-4 w-[45%] ml-2" />
                {/***************** AGREGAR PRODUCTO *****************/}
                <div>
                    <h3 className="font-semibold">AGREGAR PRODUCTO DESTACADO</h3>      
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
                {/***************** MODIFICAR PRODUCTO *****************/}
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