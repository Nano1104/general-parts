import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { authService } from "../services/auth.service.js";
import { useAuthContext } from "../context/AuthContext.jsx";

const CONFIRM_COLOR = "#D7263D";

export const useAuth = () => {
    const { setAuthUser } = useAuthContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async ({ email, password }) => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await authService.login(email, password);
            setAuthUser(data.user);
            await Swal.fire({ title: "Sesión Iniciada", confirmButtonColor: CONFIRM_COLOR });
            navigate("/authPage"); // ← en vez de reload()
        } catch (err) {
            const msg = err.response?.data?.message || "Error en la autenticación";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const register = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            const cleanPhone = formData.phone.replace(/\D/g, "");

            await authService.register({
                first_name: formData.nombre,        // ✅ mapeo explícito
                last_name: formData.apellido,        // ✅ mapeo explícito
                email: formData.email,
                phone: Number(cleanPhone),
                password: formData.password,
                city: formData.city,
                cuit: formData.cuit,
                ...(formData.location && { location: formData.location }),
                // ✅ confirmPassword no se manda al backend
            });

            await Swal.fire({ title: "Te has registrado", confirmButtonColor: "#D7263D" });
            navigate("/authPage");
        } catch (err) {
            const msg = err.response?.data?.message || "Error en el registro";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return { login, register, loading, error };
};