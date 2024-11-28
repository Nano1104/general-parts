import axios from "axios";
import { useAuthContext } from "../context/AuthContext.jsx";

import { API_URL } from "../utils/api_url.js";

const useSignin = () => {
    const { setAuthUser } = useAuthContext()

    const signIn = async ({ email, password }) => {
        try {
            await axios.post(`${API_URL}/api/auth/login`, { email, password }, { withCredentials: true })
                .then(res => {
                    setAuthUser(res.data.user)
                })
            
            /* const authUserData = await axios.get("/api/auth/authUser", { withCredentials: true })
            console.log("🚀 ~ signIn ~ authUserData:", authUserData.data._id)
            
            const user = await axios.get(`api/user/${authUserData.data._id}`, { withCredentials: true })
            setAuthUser(user.data.userFound)
            
            console.log(data); */
        } catch (err) {
            throw new Error(err.response?.data?.message || "Error en la autenticación");
        }
    }

    return { signIn }
}

export default useSignin