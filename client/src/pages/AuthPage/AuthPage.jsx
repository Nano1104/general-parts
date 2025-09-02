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
        /* console.log("🚀 ~ onSubmit ~ data:", data) */

        try {
            setLoading(true); // Activar loading al inicio
            setLoginError(''); // Limpiar errores previos

            if (login) {
                await signIn({ email: data.emailLogin, password: data.passwordLogin });
            } else {
                await signUp({
                    first_name: data.nombre,
                    last_name: data.apellido,
                    email: data.email,
                    phone: data.phone,
                    password: data.password,
                    location: data.location,
                    city: data.city,
                    cuit: data.cuit
                });
            }
        } catch (err) {
            console.log(err);
            setLoginError(err.message);
        } finally {
            setLoading(false); // Desactivar loading al final (tanto en éxito como en error)
        }
    });



    return (
        <>
            <div className="w-full overflow-y-auto relative" id="login-container">
                {/* FONDO DE AUTHPAGE */}
                <div className="bg-authPageBg hidden lg:block relative w-full h-screen bg-cover bg-center filter brightness-50 blur-[3px] grayscale"></div>
                {/* LOGO SWPARTS */}

                {/* FORM */}
                <form
                    key={login ? "login" : "register"}
                    action="post"
                    id="form"
                    onSubmit={onSubmit}
                    className="flex flex-col items-center mt-10 gap-4
                    lg:absolute lg:top-1/2 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2 
                    bg-gray lg:w-[45%] lg:rounded-2xl lg:p-10 w-full"
                >
                    <h3 className="text-cBlack text-center text-[2.5em] mt-6 font-roboto">
                        {login ? "INCIAR SESIÓN" : "REGISTRATE"}
                    </h3>

                    <div className="w-full flex flex-col gap-2">
                        {login ? (
                            <>
                                <div className="w-full flex flex-col items-center relative">
                                    <input
                                        type="email"
                                        autoComplete="off"
                                        onFocus={() => setLoginError(" ")}
                                        className="p-2 bg-transparent w-[65%] sm:w-[50%] md:w-[45%] outline-0 text-cBlack
                                                border-[1px] border-cBlack rounded-xl focus:border-dotted lg:ml-12"
                                        placeholder="Ingrese su email"
                                        {...register("emailLogin", {
                                            required: "Campo incompleto"
                                        })}
                                    />
                                    {errors.emailLogin?.type && <span className="text-red font-custom font-medium text-xs mt-2 lg:ml-12">{errors.emailLogin.message}</span>}
                                    {loginError === "User does not exist" ? <span className="text-red font-custom font-medium text-xs mt-2 lg:ml-12 xl:absolute xl:left-[47%] xl:bottom-[4px]">No existe usuario con este mail</span> : <></>}
                                </div>

                                <div className="w-full flex flex-col items-center relative">
                                    <input
                                        type="password"
                                        autoComplete="off"
                                        onFocus={() => setLoginError("")}
                                        className="p-2 bg-transparent w-[65%] sm:w-[50%] md:w-[45%] outline-0 text-cBlack
                                                border-[1px] border-cBlack rounded-xl
                                                focus:border-dotted lg:ml-12"
                                        placeholder="Ingrese su contraseña"
                                        {...register("passwordLogin", {
                                            required: "Campo incompleto"
                                        })}
                                    />
                                    {errors.passwordLogin?.type && <span className="text-red font-custom font-medium text-xs mt-2 lg:ml-12">{errors.passwordLogin.message}</span>}
                                    {loginError === "password incorrect" ? <span className="text-red font-custom font-medium text-xs mt-2 lg:ml-12">Contraseña Incorrecta</span> : <></>}
                                </div>
                            </>
                        )
                            : (
                                <>
                                    {/* FIRST_NAME && LAST_NAME */}
                                    <div className="w-full lg:flex p-4 gap-4">
                                        <div className="flex-1 flex flex-col items-center relative">
                                            <input
                                                type="text"
                                                autoComplete="off"
                                                onFocus={() => setLoginError("")}
                                                className="p-2 bg-transparent w-full outline-0 textblack
                                                    border-[1px] border-black rounded-xl
                                                    focus:border-dotted"
                                                placeholder="Ingrese su nombre"
                                                {...register("nombre", {
                                                    required: "Campo incompleto",
                                                    validate: (value) => {
                                                        const val = value.trim().split(" ");
                                                        return val.length === 1 || "Debe ingresar solo un valor (sin espacios)";
                                                    }
                                                })}
                                            />
                                            {errors.nombre?.type && <span className="text-red font-custom font-medium text-xs mt-2">{errors.nombre.message}</span>}
                                        </div>

                                        <div className="flex-1 flex flex-col items-center relative mt-4 lg:mt-0">
                                            <input
                                                type="text"
                                                autoComplete="off"
                                                onFocus={() => setLoginError("")}
                                                className="p-2 bg-transparent w-full outline-0 text-cBlack
                                                        border-[1px] border-cBlack rounded-xl
                                                        focus:border-dotted"
                                                placeholder="Ingrese su apellido"
                                                {...register("apellido", {
                                                    required: "Campo incompleto",
                                                    validate: (value) => {
                                                        const val = value.trim().split(" ");
                                                        return val.length === 1 || "Debe ingresar solo un valor (sin espacios)";
                                                    }
                                                })}
                                            />
                                            {errors.apellido?.type && <span className="text-red font-custom font-medium text-xs mt-2">{errors.apellido.message}</span>}
                                        </div>
                                    </div>

                                    {/* EMAIL && PHONE */}
                                    <div className="w-full lg:flex p-4 gap-4">
                                        <div className="flex-1 flex flex-col items-center relative">
                                            <input
                                                type="email"
                                                autoComplete="off"
                                                onFocus={() => setLoginError("")}
                                                className="p-2 bg-transparent w-full outline-0 text-cBlack
                                                    border-[1px] border-cBlack rounded-xl
                                                    focus:border-dotted"
                                                placeholder="Ingrese su email"
                                                {...register("email", {
                                                    required: "Campo incompleto",
                                                    pattern: {
                                                        value: /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/,
                                                        message: "Email no válido"
                                                    }
                                                })}
                                            />
                                            {errors.email?.type && <span className="text-red font-custom font-medium text-xs mt-2">{errors.email.message}</span>}
                                        </div>

                                        <div className="flex-1 flex flex-col items-center relative">
                                            <input
                                                type="text"
                                                autoComplete="off"
                                                onFocus={() => setLoginError("")}
                                                className="p-2 bg-transparent w-full outline-0 text-cBlack
                                                    border-[1px] border-cBlack rounded-xl
                                                    focus:border-dotted"
                                                placeholder="Ingrese su número de celular"
                                                {...register("phone", {
                                                    required: "Campo incompleto",
                                                    validate: (value) => {
                                                        return value.length === 10 || "Numero de celular no valido";
                                                    }
                                                })}
                                            />
                                            {errors.phone?.type && <span className="text-red font-custom font-medium text-xs mt-2">{errors.phone.message}</span>}
                                        </div>
                                    </div>

                                    {/* LOCATION && CITY */}
                                    <div className="w-full lg:flex p-4 gap-4">
                                        <div className="w-full flex flex-col items-center relative">
                                            <input
                                                type="text"
                                                autoComplete="off"
                                                onFocus={() => setLoginError("")}
                                                className="p-2 bg-transparent w-full outline-0 text-cBlack
                                                    border-[1px] border-cBlack rounded-xl
                                                    focus:border-dotted"
                                                placeholder="Ingrese su dirección. Ej: Calle San Martín 567"
                                                {...register("location", {
                                                    required: "Campo incompleto",
                                                })}
                                            />
                                            {errors.location?.type && <span className="text-red font-custom font-medium text-xs mt-2">{errors.location.message}</span>}
                                        </div>

                                        <FormLocalidades
                                            localidades={localidadesOrdenadas}
                                            register={register}
                                            errors={errors}
                                            name="city" // Mismo nombre que tu campo de dirección
                                        />
                                    </div>

                                    {/* CUIT && PASSWORD */}
                                    <div className="w-full lg:flex p-4 gap-4">
                                        <CUITInput
                                            register={register}
                                            errors={errors}
                                            name="cuit" // Opcional (por defecto ya es "cuit")
                                        />

                                        <div className="w-full flex flex-col items-center relative">
                                            <input
                                                type="password"
                                                autoComplete="off"
                                                onFocus={() => setLoginError("")}
                                                className="p-2 bg-transparent w-full outline-0 text-cBlack
                                                    border-[1px] border-cBlack rounded-xl
                                                    focus:border-dotted"
                                                placeholder="Ingrese su contraseña"
                                                {...register("password", {
                                                    required: "Campo incompleto",
                                                    pattern: {
                                                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)([A-Za-z\d]|[^ ]){8,15}$/,
                                                        message: "Contraseña débil"
                                                    }
                                                })}
                                            />
                                            {errors.password?.type && <span className="text-red font-custom font-medium text-xs mt-2">{errors.password.message}</span>}
                                        </div>
                                    </div>

                                    <div className="w-full flex flex-col items-center relative">
                                        <input
                                            type="password"
                                            autoComplete="off"
                                            onFocus={() => setLoginError("")}
                                            className="p-2 bg-transparent w-[65%] md:w-[45%] outline-0 text-cBlack
                                                border-[1px] border-cBlack rounded-xl
                                                focus:border-dotted lg:ml-12"
                                            placeholder="Confirmar contraseña"
                                            {...register("confirmPassword", {
                                                required: "Campo incompleto",
                                                validate: (value) => {
                                                    return value === watch("password") || "Las contraseñas no coinciden";
                                                }
                                            })}
                                        />
                                        {errors.confirmPassword?.type && <span className="text-red font-custom font-medium text-xs mt-2">{errors.confirmPassword.message}</span>}
                                    </div>
                                </>
                            )
                        }
                    </div>

                    {/* BUTTON SUBMIT  */}
                    <div className="w-full flex justify-center">
                        <button type="submit"
                            className="bg-coral w-[30%] sm:w-[20%] md:w-[15%] lg:w-[25%] 2xl:w-[20%] rounded-md py-1 text-black font-montserrat lg:ml-12">
                            {loading ? (
                                <>Procesando...</>
                            ) : (
                                login ? 'Iniciar sesión' : 'Registrarse'
                            )}
                        </button>


                        {loginError === "user already exists" ? <span className="text-orange font-custom font-medium text-xs xl:text-base mt-2 lg:ml-12 xl:absolute xl:left-[27%] xl:bottom-[4px]">Usuario ya registrado</span> : <></>}
                    </div>

                    {/* //FORM FOOTER */}
                    <div className="w-full text-cBlack flex flex-col justify-center items-center">
                        <hr className="border-cBlack mt-6 w-[75%] mx-auto" />

                        <div className="w-[80%] my-8 xl:my-2 flex flex-col">     {/* //FOOTER FORM  */}
                            <div className="flex flex-col xl:flex-row items-center xl:justify-between mt-4 gap-2">
                                <span className="ml-3 2xl:ml-5">
                                    {login ? "NO TIENES UNA CUENTA?" : "YA TIENES UNA CUENTA?"}
                                </span>
                                <div className="mr-3 2xl:mr-5">
                                    <button onClick={handleAuth}>
                                        {login ? "REGISTRAR" : "LOGIN"}
                                        <FaArrowRight className="inline-block" id="icon-back" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}



