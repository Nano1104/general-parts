import axios from "axios";
import Swal from 'sweetalert2';
import { API_URL } from "../utils/api_url.js";

const useSignup = () => {

    const signUp = async ({ first_name, last_name, email, phone, password, location, city, cuit }) => {
        try {
            const res = await axios.post(
                `${API_URL}/api/auth/register`,
                {
                    first_name,
                    last_name,
                    email,
                    phone: Number(phone),
                    password,
                    city,
                    cuit,
                    ...(location && { location })
                },
                { withCredentials: true }
            );

            console.log("🚀 ~ signUp ~ data:", res.data);

            // Primero recargar/redirigir, el Swal es solo un aviso
            await Swal.fire({
                title: 'Te has registrado',
                confirmButtonColor: "#D7263D",
            });

            window.location.reload();

        } catch (err) {
            throw new Error(err.response?.data?.message || "Error en el registro");
        }
    };

    return { signUp };
};

export default useSignup;