import axios from "axios";
import { useAuthContext } from "../context/AuthContext.jsx";
import { API_URL } from "../utils/api_url.js";

import Swal from 'sweetalert2'

const useLogout = () => { 
    const { setAuthUser } = useAuthContext()

    const logOut = async () => {
        try {
            const result = await Swal.fire({
                                title: 'Se ha cerrado la sesión!',
                                confirmButtonColor: "#ffb3a5",
                            });
    
            if (result.isConfirmed) {
                const res = await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
                setAuthUser(null);
    
                return res.data;
            }
        } catch (err) {
            throw new Error(err.response?.data?.message || "Error al intentar hacer logout");
        }
    }

    return { logOut }
}

export default useLogout