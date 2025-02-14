import axios from "axios";

import Swal from 'sweetalert2'

import { API_URL } from "../utils/api_url.js";

const useSignup = () => {

    const signUp = async ({ first_name, last_name, email, phone, password }) => {
        try {
            await axios.post(`${API_URL}/api/auth/register`, { first_name, last_name, email, phone: Number(phone), password }, { withCredentials: true })
                .then(res => {
                    Swal.fire({
                        title: 'Te has registrado',
                        confirmButtonColor: "#DC5F00",
                    })
                    .then((result) => { if (result.isConfirmed) window.location.reload() });
                })
            const data = res.data; 
            console.log("🚀 ~ signUp ~ data:", data)

        } catch (err) {
            throw new Error(err.response?.data?.message || "Error en el registro");
        }
    }

    return { signUp }
}

export default useSignup