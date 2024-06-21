import axios from "axios";

const useSignup = () => {

    const signUp = async ({ first_name, last_name, email, phone, password }) => {
        try {
            const res = await axios.post("/api/auth/register", { first_name, last_name, email, phone: Number(phone), password }, { withCredentials: true });
            const data = res.data; 

            console.log(data);
        } catch (err) {
            alert("Error register user in front")
        }
    }

    return { signUp }
}

export default useSignup