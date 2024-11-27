import axios from "axios";
import { useAuthContext } from "../context/AuthContext.jsx";

const API_URL = import.meta.env.VITE_PROD_SERVER_URL;

const useSignin = () => {
    const { setAuthUser } = useAuthContext()

    const signIn = async ({ email, password }) => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { email, password }, { withCredentials: true });
            const data = res.data; 
            
            const authUserData = await axios.get("/api/auth/authUser", { withCredentials: true })
            console.log("🚀 ~ signIn ~ authUserData:", authUserData.data._id)
            
            const user = await axios.get(`api/user/${authUserData.data._id}`, { withCredentials: true })
            setAuthUser(user.data.userFound)
            
            console.log(data);
        } catch (err) {
            throw new Error(err.response?.data?.message || "Error en la autenticación");
        }
    }

    return { signIn }
}

export default useSignin