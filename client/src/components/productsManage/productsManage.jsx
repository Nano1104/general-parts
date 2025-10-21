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
            confirmButtonColor: "#D7263D",
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

    // Función para manejar la descarga
    const handleDownloadExcel = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const rubro = formData.get('rubro').trim();

        if (!rubro) {
            Swal.fire({
                icon: 'warning',
                title: 'Campo requerido',
                text: 'Por favor ingrese un rubro',
                confirmButtonColor: '#3085d6'
            });
            return;
        }

        // Mostrar loading
        Swal.fire({
            title: 'Generando Excel...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            console.log('🔍 Iniciando descarga para rubro:', rubro);

            const response = await fetch(`${API_URL}/api/products/download-excel?rubro=${encodeURIComponent(rubro)}`);

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', response.headers);

            if (!response.ok) {
                const error = await response.json();
                console.error('❌ Error del servidor:', error);

                Swal.close(); // Cerrar loading

                // Manejo específico según el status
                if (response.status === 404) {
                    const rubrosDisponibles = error.rubrosDisponibles
                        ? `<br><br><small>Algunos rubros disponibles: ${error.rubrosDisponibles.join(', ')}</small>`
                        : '';

                    Swal.fire({
                        icon: 'error',
                        title: 'Rubro no encontrado',
                        html: `No se encontraron productos para el rubro:<br><strong>"${rubro}"</strong><br><br>Verifique que el nombre esté escrito correctamente.${rubrosDisponibles}`,
                        confirmButtonColor: '#d33'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.message || 'Error al descargar el archivo',
                        confirmButtonColor: '#d33'
                    });
                }
                return;
            }

            console.log('✅ Respuesta OK, obteniendo blob...');

            // Obtener el blob del archivo
            const blob = await response.blob();
            console.log('📦 Blob recibido, tamaño:', blob.size, 'bytes');
            console.log('📦 Blob type:', blob.type);

            // Verificar que el blob tenga contenido
            if (blob.size === 0) {
                throw new Error('El archivo descargado está vacío');
            }

            // Verificar que sea un archivo Excel válido
            if (!blob.type.includes('spreadsheet') && !blob.type.includes('excel')) {
                console.warn('⚠️ Tipo de blob inesperado:', blob.type);
            }

            console.log('💾 Creando enlace de descarga...');

            // Crear un link temporal para descargar
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `productos_${rubro.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);

            console.log('🖱️ Activando descarga...');
            a.click();

            console.log('✅ Descarga iniciada');

            // Limpiar después de un pequeño delay
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                console.log('🧹 Recursos limpiados');
            }, 100);

            Swal.close(); // Cerrar loading

            // Mostrar éxito
            Swal.fire({
                icon: 'success',
                title: '¡Descarga exitosa!',
                text: `Excel de "${rubro}" descargado correctamente`,
                timer: 2000,
                showConfirmButton: false
            });

            e.target.reset(); // Limpiar formulario

        } catch (error) {
            console.error('Error:', error);
            Swal.close(); // Cerrar loading

            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'No se pudo conectar con el servidor. Intente nuevamente.',
                confirmButtonColor: '#d33'
            });
        }
    };

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
                        <button className="bg-lightRed w-[25%] rounded-md py-1 mt-2 text-sm text-white font-medium font-poppins" type="submit">Cargar Lista</button>
                    </form>
                    <hr className="my-4 w-[45%] ml-2" />

                    {/***************** DESCARGAR LISTA DE PRODUCTOS *****************/}
                    <form method="POST" className="flex flex-col" onSubmit={handleDownloadExcel}>
                        <h3 className="font-semibold">DESCARGAR LISTA DE PRODUCTOS</h3>
                        <div className="text-sm">
                            <span className="font-medium">Nombre de rubro a descargar:</span>
                            <input
                                type="text"
                                name="rubro"
                                placeholder="Ej: ELECTRÓNICA"
                                required
                                className="w-[23%] ml-2 rounded-md py-1 px-2 my-2"
                            />
                            <br />
                            <span className="italic">Se descargará un excel de los productos con el rubro indicado</span>
                        </div>
                        <button
                            className="bg-lightRed w-[25%] rounded-md py-1 mt-2 text-sm text-white font-medium font-poppins"
                            type="submit"
                        >
                            Descargar Lista
                        </button>
                    </form>
                    <hr className="my-4 w-[45%] ml-2" />

                </div>
            </div>
        </>
    )
}