import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

import { Loading } from "../components/Loading/Loading";

export const AuthContext = createContext();

import { API_URL } from "../utils/api_url.js";

export const useAuthContext = () => {
    return useContext(AuthContext);
}

export const AuthContextProvider = ({children}) => {
    const [authUser, setAuthUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    /* const logout = async () => {
        try {
            await axios.post(`${API_URL}/api/auth/logout`, { withCredentials: true })
            setAuthUser(null)
        } catch (err) {
            console.log(err.response.data.message)
        }
    } */

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/auth/authUser`, { withCredentials: true });

                if(res.data) {
                    setAuthUser(res.data)
                    setIsAdmin(res.data.role === "admin")
                } else {
                    setAuthUser(null)
                    setIsAdmin(false)
                } 
            }
            catch (err) {
                console.log(err.response.data.message)
                setAuthUser(null);
            }
        };

        verifyUser();
    }, [])

    return (
        <AuthContext.Provider value={{ authUser, setAuthUser, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}