import axios from "axios";
import Swal from 'sweetalert2';

import { API_URL } from "../../utils/api_url.js";
import { useState } from "react";

export const ProductsManage = () => {
    const [file, setFile] = useState(null)

    /* FUNCION PARA CARGA DE EXCEL */
    const handleUpdateExcel = async (e) => {
        e.preventDefault();

        const rubroValue = e.target.rubro.value.toUpperCase();

        // Preguntar confirmación antes de iniciar
        const result = await Swal.fire({
            title: "¿Estás seguro?",
            html: `Se va a cargar la lista para el rubro: <b>${rubroValue}</b>`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, cargar",
            cancelButtonText: "No, cancelar",
            confirmButtonColor: "#ffb3a5",
            cancelButtonColor: "#6c757d"
        });

        // Si cancela, salir de la función
        if (!result.isConfirmed) return;

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
            const formData = new FormData();
            formData.append("excelFile", file);
            formData.append("rubro", rubroValue);

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


    const handleDonwloadExcel = async (e) => {
        try {

        } catch (err) {

        }
    }

    const handleChange = async (e) => {
        e.preventDefault();
        const prodId = e.target.prodId.value
        const newStock = e.target.stock.value

        const res = await axios.put(`${API_URL}/api/products/update-stock/${prodId}`, { newStock }, { withCredentials: true })
        console.log(res)
        if (res.status == 200) Swal.fire("Stock cambiado!");
    }

    return (
        <>
            <div className="px-5 h-full flex overflow-auto pb-10">
                <div className="basis-[50%]">
                    <h2 className="text-4xl font-montserrat tracking-tight font-bold mb-4">PRODUCTOS</h2>
                    {/***************** CARGAR LISTA DE PRODUCTOS *****************/}
                    <form method="POST" className="flex flex-col" onSubmit={handleUpdateExcel}>
                        <h3 className="font-semibold">CARGAR LISTA DE PRODUCTOS</h3>
                        <div className="text-sm">
                            <span className="font-medium">Nombre del rubro a cargar:</span><input type="text" name="rubro" placeholder="Rubro" required className="w-[23%] ml-2 rounded-md py-1 px-2 my-2" />
                        </div>
                        <input
                            className="w-[50%]"
                            type="file"
                            name="excelFile"
                            required
                            accept=".xlsx, .xls"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <button className="bg-coral w-[25%] rounded-md py-1 mt-2 text-sm text-cBlack font-medium font-poppins" type="submit">Cargar Lista</button>
                    </form>
                    <hr className="my-4 w-[45%] ml-2" />

                    {/***************** DESCARGAR LISTA DE PRODUCTOS *****************/}
                    <form method="POST" className="flex flex-col" onSubmit={handleDonwloadExcel}>
                        <h3 className="font-semibold">DESCARGAR LISTA DE PRODUCTOS</h3>
                        <div className="text-sm">
                            <span className="font-medium">Nombre de rubro a descargar:</span><input type="text" name="rubro" placeholder="Rubro" required className="w-[23%] ml-2 rounded-md py-1 px-2 my-2" /><br />
                            <span className="italic">Se descargara un excel de los productos con el rubro indicado</span>
                        </div>
                        <input
                            className="w-[50%] mt-4"
                            type="file"
                            name="excelFile"
                            required
                            accept=".xlsx, .xls"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        <button className="bg-coral w-[25%] rounded-md py-1 mt-2 text-sm text-cBlack font-medium font-poppins" type="submit">Descargar Lista</button>
                    </form>
                    <hr className="my-4 w-[45%] ml-2" />

                </div>
            </div>
        </>
    )
}