import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

import { Loading } from "../components/Loading/Loading";

export const AuthContext = createContext();

export const useAuthContext = () => {
    return useContext(AuthContext);
}

export const AuthContextProvider = ({children}) => {
    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const logout = async () => {
        const res = await axios.post(`/api/auth/logout`, { withCredentials: true })
        setAuthUser(null)
    }

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const res = await axios.get("/api/auth/authUser", { withCredentials: true });
                console.log("🚀 ~ verifyUser ~ res:", res)

                res.data ? setAuthUser(res.data) : setAuthUser(null)
                console.log(authUser)
            }
            catch (err) {
                console.error("Error verifying user:", err);
                setAuthUser(null);
            }
            finally {
                setLoading(false); // Indicar que la verificación ha terminado
            }
        };

        verifyUser();
    }, [])

    if (loading) {
        return <Loading />
    }

    return (
        <AuthContext.Provider value={{ authUser, setAuthUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}