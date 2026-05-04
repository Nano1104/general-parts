import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth.js";
import { FaArrowRight } from "react-icons/fa6";
import localidades from "../../utils/localidades.json";

//COMPONENTES
import LoginFields from "../../components/Auth/LoginFields.jsx";
import RegisterFields from "../../components/Auth/RegisterFields.jsx";
/* import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner.jsx"; */


const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-sm font-medium">
                Cargando...
            </span>
        </div>
    );
};

// Constantes fuera del componente — no se recrean en cada render
const localidadesOrdenadas = [...localidades].sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // ← regex simple y correcto

// Mapa de mensajes de error del backend → mensaje para el usuario
const ERROR_MESSAGES = {
    "User does not exist": "No existe usuario con este email",
    "password incorrect": "Contraseña incorrecta",
    "user already exists": "Este email ya está registrado",
};

export const AuthPage = () => {
    const { login, register: registerUser, loading, error } = useAuth();
    const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const toggleMode = () => {
        reset();
        setIsLoginMode(prev => !prev);
    };

    const onSubmit = handleSubmit(async (data) => {
        if (isLoginMode) {
            await login({ email: data.emailLogin, password: data.passwordLogin });
        } else {
            await registerUser(data);
        }
    });

    // Mensaje de error legible para el usuario
    const errorMessage = error ? (ERROR_MESSAGES[error] ?? error) : null;

    return (
        <div className="w-full min-h-screen overflow-y-auto relative bg-gray-50 lg:bg-transparent">
            <div className="bg-authPageBg hidden lg:block fixed inset-0 w-full h-full bg-cover bg-center filter brightness-50 blur-[3px] grayscale -z-10" />

            <div className="min-h-screen flex items-center justify-center p-4 lg:p-0 border-t border-gray-200">
                <form
                    key={isLoginMode ? "login" : "register"}
                    onSubmit={onSubmit}
                    className="w-full max-w-md sm:max-w-lg lg:max-w-2xl xl:max-w-3xl
                               bg-cWhite rounded-2xl shadow-xl lg:shadow-2xl
                               p-6 sm:p-8 lg:p-10 space-y-6
                               border border-gray-200 lg:border-gray-300"
                >
                    <div className="text-center">
                        <h1 className="text-cBlack text-2xl sm:text-3xl lg:text-4xl font-roboto font-bold">
                            {isLoginMode ? "INICIAR SESIÓN" : "REGISTRARSE"}
                        </h1>
                    </div>

                    <div className="space-y-4 lg:space-y-6">
                        {isLoginMode ? (
                            <LoginFields register={register} errors={errors} />
                        ) : (
                            <RegisterFields
                                register={register}
                                errors={errors}
                                watch={watch}
                                showPassword={showPassword}
                                onTogglePassword={() => setShowPassword(p => !p)}
                                localidades={localidadesOrdenadas}
                            />
                        )}
                    </div>

                 
                    {errorMessage && (
                        <p className="text-lightRed font-medium text-sm text-center">
                            {errorMessage}
                        </p>
                    )}

                    <div className="flex flex-col items-center space-y-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-lightRed hover:bg-red-600 disabled:bg-gray-400
                                       w-full max-w-xs sm:max-w-sm lg:max-w-md
                                       rounded-lg py-3 px-6 text-white font-montserrat font-medium
                                       transition-all duration-200 transform hover:scale-105
                                       disabled:hover:scale-100 shadow-md hover:shadow-lg"
                        >
                            {loading ? <LoadingSpinner /> : (isLoginMode ? "Iniciar sesión" : "Registrarse")}
                        </button>
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-cBlack">
                            <span className="text-sm font-medium">
                                {isLoginMode ? "¿NO TIENES UNA CUENTA?" : "¿YA TIENES UNA CUENTA?"}
                            </span>
                            <button type="button" onClick={toggleMode}
                                className="flex items-center gap-2 text-sm font-medium hover:text-lightRed transition-colors">
                                {isLoginMode ? "REGISTRARSE" : "INICIAR SESIÓN"}
                                <FaArrowRight className="text-sm" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};