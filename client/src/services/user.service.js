import axios from "axios";
import { API_URL } from "../utils/api_url.js";

const client = axios.create({
    baseURL: `${API_URL}/api/user`,
    withCredentials: true,
});

export const userService = {
    getAll: () => client.get("/"),
    accept: (id) => client.put(`/accept/${id}`, {}),
    deny: (id) => client.put(`/denied/${id}`, {}),
    remove: (id) => client.delete(`/${id}`),
    changeDiscount: (id, field, value) =>
        client.put(`/change-discount/${id}`, { field, value }),
};