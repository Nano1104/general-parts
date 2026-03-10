import axios from "axios";
import { useAuthContext } from "../context/AuthContext.jsx";
import Swal from 'sweetalert2';
import { API_URL } from "../utils/api_url.js";

const useSignin = () => {
    const { setAuthUser } = useAuthContext();

    const signIn = async ({ email, password }) => {
        try {
            const res = await axios.post(
                `${API_URL}/api/auth/login`,
                { email, password },
                { withCredentials: true }
            );

            // Primero actualizar el estado, luego mostrar el Swal
            // Así el usuario queda logueado independientemente del modal
            setAuthUser(res.data.user);

            await Swal.fire({
                title: 'Sesión Iniciada',
                confirmButtonColor: "#D7263D",
            });

        } catch (err) {
            throw new Error(err.response?.data?.message || "Error en la autenticación");
        }
    };

    return { signIn };
};

export default useSignin;