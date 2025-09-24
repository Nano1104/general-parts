import { useState, useEffect } from "react";
//hooks
import { useForm } from "react-hook-form"
import useSignup from "../../hooks/useSigup.js"
import useSignin from "../../hooks/useSingin.js"
//components
import { FormLocalidades } from "../../components/FormLocalidades/FormLocalidades.jsx";
import { CUITInput } from "../../components/CUITInput/CUITInput.jsx";
//icons
import { FaArrowRight } from "react-icons/fa6";
//json
import localidades from "../../utils/localidades.json";
// Ordenar alfabéticamente una sola vez
const localidadesOrdenadas = [...localidades].sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
);

export const AuthPage = () => {
    const { signIn } = useSignin()
    const { signUp } = useSignup()
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [login, setLogin] = useState(true)
    const [loginError, setLoginError] = useState(" ")
    const [loading, setLoading] = useState(false)

    const handleAuth = () => {
        setLoginError("")
        setLogin(login => !login)
    };

    const onSubmit = handleSubmit(async (data) => {
        try {
            setLoading(true);
            setLoginError('');

            if (login) {
                await signIn({ email: data.emailLogin, password: data.passwordLogin });
            } else {
                await signUp({
                    first_name: data.nombre,
                    last_name: data.apellido,
                    email: data.email,
                    phone: data.phone,
                    password: data.password,
                    city: data.city,
                    cuit: data.cuit,
                    ...(data.location && { location: data.location })
                });
            }
        } catch (err) {
            console.log(err);
            setLoginError(err.message);
        } finally {
            setLoading(false);
        }
    });

    return (
        <div className="w-full min-h-screen overflow-y-auto relative bg-gray-50 lg:bg-transparent" id="login-container">
            {/* FONDO DE AUTHPAGE - Solo Desktop */}
            <div className="bg-authPageBg hidden lg:block fixed inset-0 w-full h-full bg-cover bg-center filter brightness-50 blur-[3px] grayscale -z-10"></div>

            {/* CONTENEDOR PRINCIPAL */}
            <div className="min-h-screen flex items-center justify-center p-4 lg:p-0">
                {/* FORM */}
                <form
                    key={login ? "login" : "register"}
                    action="post"
                    id="form"
                    onSubmit={onSubmit}
                    className="w-full max-w-md sm:max-w-lg lg:max-w-2xl xl:max-w-3xl
                             bg-cWhite rounded-2xl shadow-xl lg:shadow-2xl
                             p-6 sm:p-8 lg:p-10 space-y-6
                             border border-gray-200 lg:border-gray-300"
                >
                    {/* TÍTULO */}
                    <div className="text-center">
                        <h1 className="text-cBlack text-2xl sm:text-3xl lg:text-4xl xl:text-[2.5em] font-roboto font-bold">
                            {login ? "INICIAR SESIÓN" : "REGISTRARSE"}
                        </h1>
                    </div>

                    {/* CAMPOS DEL FORMULARIO */}
                    <div className="space-y-4 lg:space-y-6">
                        {login ? (
                            /* FORMULARIO DE LOGIN */
                            <>
                                <div className="space-y-4">
                                    <div className="w-full">
                                        <input
                                            type="email"
                                            autoComplete="off"
                                            onFocus={() => setLoginError(" ")}
                                            className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                                                     border border-cBlack rounded-xl transition-all duration-200
                                                     focus:border-lightRed focus:border-2 focus:shadow-md
                                                     placeholder:text-gray-500"
                                            placeholder="Ingrese su email"
                                            {...register("emailLogin", {
                                                required: "Campo incompleto"
                                            })}
                                        />
                                        {errors.emailLogin?.type && (
                                            <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                                                {errors.emailLogin.message}
                                            </span>
                                        )}
                                        {loginError === "User does not exist" && (
                                            <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                                                No existe usuario con este mail
                                            </span>
                                        )}
                                    </div>

                                    <div className="w-full">
                                        <input
                                            type="password"
                                            autoComplete="off"
                                            onFocus={() => setLoginError("")}
                                            className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                                                     border border-cBlack rounded-xl transition-all duration-200
                                                     focus:border-lightRed focus:border-2 focus:shadow-md
                                                     placeholder:text-gray-500"
                                            placeholder="Ingrese su contraseña"
                                            {...register("passwordLogin", {
                                                required: "Campo incompleto"
                                            })}
                                        />
                                        {errors.passwordLogin?.type && (
                                            <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                                                {errors.passwordLogin.message}
                                            </span>
                                        )}
                                        {loginError === "password incorrect" && (
                                            <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                                                Contraseña Incorrecta
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* FORMULARIO DE REGISTRO */
                            <>
                                {/* NOMBRE Y APELLIDO */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="w-full">
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            onFocus={() => setLoginError("")}
                                            className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                                                     border border-cBlack rounded-xl transition-all duration-200
                                                     focus:border-lightRed focus:border-2 focus:shadow-md
                                                     placeholder:text-gray-500"
                                            placeholder="Ingrese su nombre"
                                            {...register("nombre", {
                                                required: "Campo incompleto",
                                                validate: (value) => {
                                                    const val = value.trim().split(" ");
                                                    return val.length === 1 || "Debe ingresar solo un valor (sin espacios)";
                                                }
                                            })}
                                        />
                                        {errors.nombre?.type && (
                                            <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                                                {errors.nombre.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className="w-full">
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            onFocus={() => setLoginError("")}
                                            className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                                                     border border-cBlack rounded-xl transition-all duration-200
                                                     focus:border-lightRed focus:border-2 focus:shadow-md
                                                     placeholder:text-gray-500"
                                            placeholder="Ingrese su apellido"
                                            {...register("apellido", {
                                                required: "Campo incompleto",
                                                validate: (value) => {
                                                    const val = value.trim().split(" ");
                                                    return val.length === 1 || "Debe ingresar solo un valor (sin espacios)";
                                                }
                                            })}
                                        />
                                        {errors.apellido?.type && (
                                            <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                                                {errors.apellido.message}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* EMAIL Y TELÉFONO */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="w-full">
                                        <input
                                            type="email"
                                            autoComplete="off"
                                            onFocus={() => setLoginError("")}
                                            className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                                                     border border-cBlack rounded-xl transition-all duration-200
                                                     focus:border-lightRed focus:border-2 focus:shadow-md
                                                     placeholder:text-gray-500"
                                            placeholder="Ingrese su email"
                                            {...register("email", {
                                                required: "Campo incompleto",
                                                pattern: {
                                                    value: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/,
                                                    message: "Email no válido"
                                                }
                                            })}
                                        />
                                        {errors.email?.type && (
                                            <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                                                {errors.email.message}
                                            </span>
                                        )}
                                    </div>

                                    <div className="w-full">
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            onFocus={() => setLoginError("")}
                                            className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                                                     border border-cBlack rounded-xl transition-all duration-200
                                                     focus:border-lightRed focus:border-2 focus:shadow-md
                                                     placeholder:text-gray-500"
                                            placeholder="Ingrese su número de celular"
                                            {...register("phone", {
                                                required: "Campo incompleto",
                                                validate: (value) => {
                                                    return value.length === 10 || "Numero de celular no valido";
                                                }
                                            })}
                                        />
                                        {errors.phone?.type && (
                                            <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                                                {errors.phone.message}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* DIRECCIÓN Y CIUDAD */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="w-full">
                                        <input
                                            type="text"
                                            autoComplete="off"
                                            onFocus={() => setLoginError("")}
                                            className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                                                     border border-cBlack rounded-xl transition-all duration-200
                                                     focus:border-lightRed focus:border-2 focus:shadow-md
                                                     placeholder:text-gray-500"
                                            placeholder="Ingrese su dirección. Ej: Calle San Martín 567"
                                            {...register("location")}
                                        />
                                    </div>

                                    <div className="w-full">
                                        <FormLocalidades
                                            localidades={localidadesOrdenadas}
                                            register={register}
                                            errors={errors}
                                            name="city"
                                        />
                                    </div>
                                </div>

                                {/* CUIT Y CONTRASEÑA */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="w-full">
                                        <CUITInput
                                            register={register}
                                            errors={errors}
                                            name="cuit"
                                        />
                                    </div>

                                    <div className="w-full">
                                        <input
                                            type="password"
                                            autoComplete="off"
                                            onFocus={() => setLoginError("")}
                                            className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                                                     border border-cBlack rounded-xl transition-all duration-200
                                                     focus:border-lightRed focus:border-2 focus:shadow-md
                                                     placeholder:text-gray-500"
                                            placeholder="Ingrese su contraseña"
                                            {...register("password", {
                                                required: "Campo incompleto",
                                                pattern: {
                                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)([A-Za-z\d]|[^ ]){8,15}$/,
                                                    message: "Contraseña débil"
                                                }
                                            })}
                                        />
                                        {errors.password?.type && (
                                            <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                                                {errors.password.message}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* CONFIRMAR CONTRASEÑA */}
                                <div className="w-full max-w-md mx-auto">
                                    <input
                                        type="password"
                                        autoComplete="off"
                                        onFocus={() => setLoginError("")}
                                        className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                                                 border border-cBlack rounded-xl transition-all duration-200
                                                 focus:border-lightRed focus:border-2 focus:shadow-md
                                                 placeholder:text-gray-500"
                                        placeholder="Confirmar contraseña"
                                        {...register("confirmPassword", {
                                            required: "Campo incompleto",
                                            validate: (value) => {
                                                return value === watch("password") || "Las contraseñas no coinciden";
                                            }
                                        })}
                                    />
                                    {errors.confirmPassword?.type && (
                                        <span className="text-lightRed font-medium text-xs sm:text-sm mt-2 block">
                                            {errors.confirmPassword.message}
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* BOTÓN SUBMIT */}
                    <div className="flex flex-col items-center space-y-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-lightRed hover:bg-red-600 disabled:bg-gray-400
                                     w-full max-w-xs sm:max-w-sm lg:max-w-md
                                     rounded-lg py-3 px-6
                                     text-white font-montserrat font-medium
                                     transition-all duration-200
                                     transform hover:scale-105 disabled:hover:scale-100
                                     shadow-md hover:shadow-lg
                                     focus:outline-none focus:ring-2 focus:ring-lightRed/50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Procesando...
                                </span>
                            ) : (
                                login ? 'Iniciar sesión' : 'Registrarse'
                            )}
                        </button>

                        {/* ERROR DE USUARIO YA EXISTENTE */}
                        {loginError === "user already exists" && (
                            <span className="text-orange font-medium text-xs sm:text-sm text-center">
                                Usuario ya registrado
                            </span>
                        )}
                    </div>

                    {/* FOOTER DEL FORMULARIO */}
                    <div className="pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-cBlack">
                            <span className="text-sm sm:text-base font-medium text-center sm:text-left">
                                {login ? "¿NO TIENES UNA CUENTA?" : "¿YA TIENES UNA CUENTA?"}
                            </span>
                            <button
                                type="button"
                                onClick={handleAuth}
                                className="flex items-center gap-2 text-sm sm:text-base font-medium
                                         hover:text-lightRed transition-colors duration-200
                                         focus:outline-none focus:text-lightRed"
                            >
                                {login ? "REGISTRARSE" : "INICIAR SESIÓN"}
                                <FaArrowRight className="text-sm" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}



