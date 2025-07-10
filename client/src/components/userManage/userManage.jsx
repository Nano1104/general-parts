import axios from "axios";
import Swal from 'sweetalert2';
import { useEffect, useState } from "react"
import { User } from "../User/User.jsx";
import { API_URL } from "../../utils/api_url.js";

const showErrorAlert = (message) => {
    Swal.fire({
        title: "Error",
        text: message,
        icon: "error",
        confirmButtonColor: "#DC5F00",
    });
};

export const UserManage = () => {
    const [users, setUsers] = useState([])

    const handleGetUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/user`, { withCredentials: true })
            setUsers([...res.data.users])
        } catch (err) {
            console.log(err.message)
        }
    }

    const handleDeleteUser = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.delete(`${API_URL}/api/user/${e.target.prodId.value}`, { withCredentials: true })
            console.log(res)
            await handleGetUsers()

            if(res.status == 200) {
                Swal.fire({
                    title: "Usuario Eliminado!",
                    icon: "success",
                    confirmButtonColor: "#DC5F00",
                    backdrop: true
                });
            } 
        } catch (err) {
            Swal.fire({
                title: "Error",
                text: "Id ingresado puedo ser incorrecto",
                icon: "error",
                confirmButtonColor: "#DC5F00",
                backdrop: true
            });
            console.log(err)
        }
    }

    const handleUpdateUser = async (e) => {
        try {
            
        } catch (err) {
            console.log(err)
        }
    }

    const handleUserAction = async (e, action) => {
        e.preventDefault();
        const userId = e.target.userId.value.trim();

        // Validación del input
        if (!userId) {
            showErrorAlert("Por favor, ingresa un ID de usuario válido.");
            return;
        }

        try {
            // Mostrar loader durante la operación
            const { isConfirmed } = await Swal.fire({
                title: 'Confirmar acción',
                text: `¿Estás seguro de querer ${action === 'accept' ? 'aceptar' : 'rechazar'} al usuario?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#DC5F00',
                cancelButtonColor: '#BDC3C7',
                confirmButtonText: 'Sí, continuar',
                cancelButtonText: 'Cancelar'
            });

            if (!isConfirmed) return;

            Swal.fire({
                title: 'Procesando...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Realizar la petición
            const endpoint = action === 'accept' 
                ? `${API_URL}/api/user/accept/${userId}`
                : `${API_URL}/api/user/denied/${userId}`;

            const response = await axios.put(endpoint, {}, { withCredentials: true });

            // Manejo de respuesta exitosa
            Swal.fire({
                title: `Usuario ${action === 'accept' ? 'Aceptado' : 'Denegado'}!`,
                text: response.data?.message || `El usuario ha sido ${action === 'accept' ? 'dado de alta' : 'dado de baja'} correctamente.`,
                icon: 'success',
                confirmButtonColor: '#DC5F00',
            });

        } catch (err) {
            console.error("Error en handleUserAction:", err);
            
            if (err.response?.status === 404) {
                // Caso específico: Usuario no encontrado
                Swal.fire({
                    title: 'Usuario no encontrado',
                    text: 'No existe ningún usuario con el ID proporcionado',
                    icon: 'error',
                    confirmButtonColor: '#DC5F00',
                });
            } else {
                // Otros tipos de errores
                Swal.fire({
                    title: 'Error',
                    text: err.response?.data?.message || 'Ocurrió un error inesperado',
                    icon: 'error',
                    confirmButtonColor: '#DC5F00',
                });
            }
        }
    };
        
    useEffect(() => { }, [users])

    return(
        <>
        <div className="px-5 h-full flex">
            <div className="basis-[50%]">
                <h2 className="text-4xl font-montserrat tracking-tight font-bold mb-3">USUARIOS</h2>
                <div>
                    <h3 className="font-semibold">VER USUARIOS</h3>
                    <button className="bg-orange w-[30%] rounded-md py-1 text-sm text-white font-medium font-poppins" type="submit" onClick={handleGetUsers}>Ver lista de usuarios</button>
                </div>

                <hr className="my-4 w-[45%] ml-2" />

                <div className="flex flex-col">
                    <h3 className="font-semibold">BORRAR USUARIO DE LA BASE DE DATOS</h3>
                    <form action="" className="flex flex-col text-sm" onSubmit={handleDeleteUser}>
                        <input type="text" name="prodId" placeholder="Ingresar ID del usuario" className="w-[30%] rounded-md py-1 px-2 my-2" />
                        <button className="bg-orange w-[30%] rounded-md py-1 text-sm text-white font-medium font-poppins" type="submit">Borrar usuario</button>
                    </form>
                </div>

                <hr className="my-4 w-[45%] ml-2" />

                <div className="flex flex-col"> {/* space-y-4 */}
                    <h3 className="font-semibold">ACCESO DEL USUARIO</h3>
                    
                    {/* Formulario de Alta */}
                    <form className="flex items-center gap-2 text-sm" onSubmit={(e) => handleUserAction(e, "accept")}>
                        <input 
                            type="text" 
                            name="userId" 
                            placeholder="Ingresar ID del usuario" 
                            className="w-[35%] h-7 rounded-md py-1 px-2 my-2" 
                            required
                        />
                        <button 
                            className="w-[25%] h-7 bg-orange rounded-md py-1 text-sm text-white font-medium font-poppins" 
                            type="submit"
                        >
                            Dar de ALTA al usuario
                        </button>
                    </form>

                    {/* Formulario de Baja */}
                    <form className="flex items-center gap-2 text-sm" onSubmit={(e) => handleUserAction(e, "denied")}>
                        <input 
                            type="text" 
                            name="userId" 
                            placeholder="Ingresar ID del usuario" 
                            className="w-[35%] h-7 rounded-md py-1 px-2 my-2" 
                            required
                        />
                        <button 
                            className="w-[25%] h-7 bg-red rounded-md py-1 text-sm text-white font-medium font-poppins" 
                            type="submit"
                        >
                            Dar de BAJA al usuario
                        </button>
                    </form>
                </div>

                <hr className="my-4 w-[45%] ml-2" />

                <div className="flex flex-col">
                    <h3 className="font-semibold">MODIFICAR USUARIO</h3>
                    <form action="" className="flex flex-col text-sm" onSubmit={handleUpdateUser}>
                        <div>
                            <label className="font-medium">Id del producto:</label><input type="text" placeholder="Ingresar ID del usuario" className="w-[30%] rounded-md py-1 px-2 my-1 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Email:</label><input type="text" placeholder="Nuevo email" className="w-[30%] rounded-md py-1 px-2 my-1 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Telofono/celular</label><input type="text" placeholder="Nuevo Telofono/celular" className="w-[30%] rounded-md py-1 px-2 my-1 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Rol</label><input type="text" placeholder="Nuevo rol" className="w-[30%] rounded-md py-1 px-2 my-1 ml-2" />
                        </div>
                        <button className="bg-orange w-[30%] rounded-md py-1 text-sm text-white font-medium font-poppins mt-1" type="submit">Modificar usuario</button>
                    </form>
                </div>
                <hr className="my-4 w-[45%] ml-2" />
           </div>

           <div className="basis-[50%] overflow-y-auto border-l">
                <div>
                    {
                        users.map(user => <User userData={user} />)
                    }
                </div>
           </div>
        </div>
        </>
    )
}