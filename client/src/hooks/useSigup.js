import axios from "axios";

const API_URL = import.meta.env.VITE_PROD_SERVER_URL;

const useSignup = () => {

    const signUp = async ({ first_name, last_name, email, phone, password }) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/register`, { first_name, last_name, email, phone: Number(phone), password }, { withCredentials: true });
            const data = res.data; 

            console.log(data);
        } catch (err) {
            throw new Error(err.response?.data?.message || "Error en el registro");
        }
    }

    return { signUp }
}

export default useSignup