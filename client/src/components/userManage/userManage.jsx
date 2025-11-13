import axios from "axios";
import Swal from 'sweetalert2';
import { useEffect, useState } from "react"
import { User } from "../User/User.jsx";
import { API_URL } from "../../utils/api_url.js";
import { Loading } from "../Loading/Loading.jsx";

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
    const [loading, setLoading] = useState(false)


    // 🔹 función para actualizar el descuento de un usuario localmente y en el backend
    const handleDiscountChange = async (userId, field, newDiscount) => {
        try {
            // 🔹 Actualiza localmente primero
            setUsers(prevUsers =>
                prevUsers.map(u =>
                    u._id === userId ? { ...u, [field]: newDiscount } : u
                )
            );

            // 🔹 Llama al backend
            await axios.put(
                `${API_URL}/api/user/change-discount/${userId}`,
                { field, value: newDiscount },
                { withCredentials: true }
            );
        } catch (err) {
            console.error("Error cambiando descuento:", err.message);
            Swal.fire({
                title: "Error al cambiar descuento",
                icon: "error",
                confirmButtonColor: "#D7263D"
            });
        }
    };

    const handleDeleteUser = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.delete(`${API_URL}/api/user/${e.target.prodId.value}`, { withCredentials: true })
            await handleGetUsers()

            if (res.status == 200) {
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
                confirmButtonColor: '#D7263D',
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

            await handleGetUsers()

            // Manejo de respuesta exitosa
            Swal.fire({
                title: `Usuario ${action === 'accept' ? 'Aceptado' : 'Denegado'}!`,
                icon: 'success',
                confirmButtonColor: '#D7263D',
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

    useEffect(() => {
        const handleGetUsers = async () => {
            try {
                setLoading(true);
                await new Promise((resolve) => setTimeout(resolve, 500)); // podés acortar el delay si querés

                const res = await axios.get(`${API_URL}/api/user`, { withCredentials: true });
                setUsers(res.data.users);
            } catch (err) {
                console.log(err.message);
            } finally {
                setLoading(false);
            }
        };

        handleGetUsers();
    }, []); // 👈 sin dependencias, para que se ejecute solo una vez al montar


    return (
        <>
            <div className="px-5 h-full flex">
                <div className="basis-[50%]">
                    <h2 className="text-4xl font-montserrat tracking-tight font-bold mb-3">USUARIOS</h2>

                    {/* // BORRAR USUARIO DE LA BASE DE DATOS */}
                    <div className="flex flex-col">
                        <h3 className="font-semibold">BORRAR USUARIO DE LA BASE DE DATOS</h3>
                        <form action="" className="flex flex-col text-sm" onSubmit={handleDeleteUser}>
                            <input type="text" name="prodId" placeholder="Ingresar ID del usuario" className="w-[50%] rounded-md py-1 px-2 my-2" />
                            <button className="bg-lightRed w-[30%] rounded-md py-1 text-sm text-cWhite font-medium font-poppins" type="submit">Borrar usuario</button>
                        </form>
                    </div>
                    <hr className="my-4 w-[45%] ml-2" />

                    {/* // ACCESO DEL USUARIO - accepted - denied */}
                    <div className="flex flex-col">
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
                                className="w-[25%] h-7 bg-lightRed rounded-md py-1 text-sm text-cWhite font-medium font-poppins"
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
                                className="w-[25%] h-7 bg-orange rounded-md py-1 text-sm text-cWhite font-medium font-poppins"
                                type="submit"
                            >
                                Dar de BAJA al usuario
                            </button>
                        </form>
                    </div>
                    <hr className="my-4 w-[45%] ml-2" />
                </div>

                <div className="basis-[50%] overflow-y-auto border-l">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <span className="text-xl">Cargando Usuarios...</span>
                        </div>
                    ) : users.length > 0 ? (
                        users.map(user => (
                            <User
                                key={user._id}
                                userData={user}
                                onDiscountChange={handleDiscountChange}
                            />
                        ))
                    ) : (
                        <div className="flex justify-center items-center h-full">
                            <span className="text-xl">Lista de usuarios</span>
                        </div>
                    )}
                </div>

            </div>
        </>
    )
}