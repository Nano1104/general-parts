import axios from "axios";
import { useAuthContext } from "../context/AuthContext.jsx";

import Swal from 'sweetalert2'

import { API_URL } from "../utils/api_url.js";

const useSignin = () => {
    const { setAuthUser } = useAuthContext()

    const signIn = async ({ email, password }) => {
        try {
            await axios.post(`${API_URL}/api/auth/login`, { email, password }, { withCredentials: true })
                .then(res => {
                    Swal.fire({
                        title: 'Sesión Iniciada',
                        confirmButtonColor: "#ffb3a5",
                    })
                    .then((result) => { 
                        if (result.isConfirmed) setAuthUser(res.data.user)
                            console.log("🚀 ~ .then ~ res.data.user:", res.data.user)
                     });
                })
            

        } catch (err) {
            throw new Error(err.response?.data?.message || "Error en la autenticación");
        }
    }


    return { signIn }
}

export default useSignin