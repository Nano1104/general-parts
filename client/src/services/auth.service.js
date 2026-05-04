import axios from "axios";
import { API_URL } from "../utils/api_url.js";

const authClient = axios.create({
    baseURL: `${API_URL}/api/auth`,
    withCredentials: true,
});

export const authService = {
    login: (email, password) =>
        authClient.post("/login", { email, password }),

    register: (payload) =>
        authClient.post("/register", payload),
};