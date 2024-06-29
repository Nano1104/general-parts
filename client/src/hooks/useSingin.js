import axios from "axios";
import { useAuthContext } from "../context/AuthContext.jsx";

const useSignin = () => {
    const { setAuthUser } = useAuthContext()

    const signIn = async ({ email, password }) => {
        try {
            const res = await axios.post("/api/auth/login", { email, password }, { withCredentials: true });
            const data = res.data; 
            
            const authUserData = await axios.get("/api/auth/authUser", { withCredentials: true })

            const user = await axios.get(`api/user/${authUserData.data.userId}`, { withCredentials: true })
            setAuthUser(user.data.userFound)
            
            console.log(data);
        } catch (err) {
            alert(err.message);
        }
    }

    return { signIn }
}

export default useSignin