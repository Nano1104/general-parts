import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

import { Loading } from "../components/Loading/Loading";

export const AuthContext = createContext();

import { API_URL } from "../utils/api_url.js";

export const useAuthContext = () => {
    return useContext(AuthContext);
}

export const AuthContextProvider = ({children}) => {
    const [state, setState] = useState({
        authUser: null,
        isAdmin: false,
        loading: true,
        error: null
    });

    useEffect(() => {
        const source = axios.CancelToken.source();

        const verifyUser = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/auth/authUser`, { 
                    withCredentials: true,
                    cancelToken: source.token
                });

                if(res.data) {
                    setState({
                        authUser: res.data,
                        isAdmin: res.data.role === "admin",
                        loading: false,
                        error: null
                    });
                } else {
                    setState(prev => ({
                        ...prev,
                        authUser: null,
                        isAdmin: false,
                        loading: false
                    }));
                } 
            }
            catch (err) {
                if (axios.isCancel(err)) {
                    console.log('Request canceled:', err.message);
                } else {
                    console.error('Auth error:', err.response?.data?.message || err.message);
                    setState(prev => ({
                        ...prev,
                        authUser: null,
                        isAdmin: false,
                        loading: false,
                        error: err.response?.data?.message || 'Authentication error'
                    }));
                }
            }
        };

        verifyUser();

        return () => source.cancel('Component unmounted');
    }, []);

    const setAuthUser = (user) => {
        setState({
            authUser: user,
            isAdmin: user?.role === "admin",
            loading: false,
            error: null
        });
    };

    if (state.loading) {
        return <Loading />; 
    }

    return (
        <AuthContext.Provider value={{ 
            authUser: state.authUser, 
            setAuthUser, 
            isAdmin: state.isAdmin,
            error: state.error
        }}>
            {children}
        </AuthContext.Provider>
    );
}