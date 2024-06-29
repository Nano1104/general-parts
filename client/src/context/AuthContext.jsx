import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
}

export const AuthContextProvider = ({children}) => {
    const [authUser, setAuthUser] = useState();

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const res = await axios.get("/api/auth/authUser", { withCredentials: true });
                console.log(res.data)
            } catch (err) {
                console.error("Error verifying user:", err);
                setAuthUser(null);
            }
        };

        verifyUser();
    }, [])

    return (
        <AuthContext.Provider value={{ authUser, setAuthUser }}>
            {children}
        </AuthContext.Provider>
    );
}