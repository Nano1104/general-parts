import { useState } from "react";
import { Link } from "react-router-dom";
//hooks
import { useForm } from "react-hook-form"
import useSignup from "../../hooks/useSigup.js"
import useSignin from "../../hooks/useSingin.js"
//icons
import { FaArrowRight } from "react-icons/fa6";     //icons

export const AuthPage = () => {
    const { signIn } = useSignin()
    const { signUp } = useSignup()
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [login, setLogin] = useState(true)
    const [loginError, setLoginError] = useState(" ")

    
    const handleAuth = () => {
        setLoginError("")
        setLogin(login => !login)
    };
    
    const onSubmit = handleSubmit(async (data) => {
        try {
            if(login) {
                await signIn({email: data.emailLogin, password: data.passwordLogin })
            } else {
                await signUp({first_name: data.nombre, last_name: data.apellido, email: data.email, phone: data.phone, password: data.password})
            }
        } catch (err) {
            console.log(err)
            setLoginError(err.message)
        }
    })
     
    return(
        <>
        <div className="w-full overflow-y-auto relative" id="login-container">
            {/* FONDO DE AUTHPAGE */}
            <div className="bg-authPageBg hidden lg:block relative w-full h-screen bg-cover bg-center filter brightness-50 blur-[3px] grayscale"></div>

            <Link to="/" className="relative flex flex-col items-center lg:flex-row top-4 lg:absolute lg:top-0 lg:my-7 lg:left-[7%]">
                <span className="font-extrabold text-orange font-poppins tracking-tighter italic text-[4.4em] md:text-[6.4em] lg:text-[8em] 2xl:text-[9em]">SW</span>
                <span className="font-bold text-white font-poppins tracking-tight italic absolute lg:static top-12 md:top-16 text-[4.4em] md:text-[6.4em] lg:text-[8em] 2xl:text-[9em]">Parts</span>
            </Link>
            <hr className="border-white mt-[20%] w-[75%] mx-auto lg:hidden" />
            
            <form key={login ? "login" : "register"} action="post" id="form"
                className="flex flex-col items-center mt-10 gap-4
                lg:absolute lg:top-[15%] lg:right-[5%] lg:rounded-[50px] lg:border-4 border-white border-double lg:bg-[#272829] lg:w-[500px]
                xl:w-[40%] xl:h-[95vh] xl:top-0 xl:rounded-[20px] xl:mt-4
                2xl:w-[45%] 2xl:h-[70vh] 2xl:top-[15%] 2xl:right-0 2xl:rounded-none 2xl:rounded-tl-[50px] 2xl:rounded-bl-[50px] 2xl:border-r-0"
                onSubmit={onSubmit}
            >
                <h3 className="text-white text-center text-[2.5em] mt-6 2xl:mt-10 font-roboto">
                    { login ? "INCIAR SESIÓN" : "REGISTRATE" }
                </h3>

                <div className="w-full flex flex-col gap-2 2xl:mt-10">
                { login 
                    ?   //login inputs
                    <>
                        <div className="w-full flex flex-col xl:flex-row items-center lg:items-start relative">
                            <input 
                                type="email"
                                autoComplete="off"
                                onFocus={() => setLoginError(" ")}
                                className="p-2 bg-transparent w-[65%] sm:w-[50%] md:w-[45%] outline-0 text-white
                                border-[1px] border-white rounded-xl focus:border-dotted lg:ml-12"
                                placeholder="Ingrese su email"
                                { ...register("emailLogin", {
                                    required: "Campo incompleto"
                                }) }
                            />
                            {errors.emailLogin?.type && <span className="text-orange font-custom font-medium text-xs mt-2 lg:ml-12 xl:absolute xl:left-[47%] xl:bottom-[4px]">{errors.emailLogin.message}</span>}
                            {loginError === "User does not exist" ? <span className="text-orange font-custom font-medium text-xs mt-2 lg:ml-12 xl:absolute xl:left-[47%] xl:bottom-[4px]">No existe usuario con este mail</span> : <></>}
                        </div>

                        <div className="w-full flex flex-col items-center lg:items-start relative">
                            <input 
                                type="password"
                                autoComplete="off"
                                onFocus={() => setLoginError("")}
                                className="p-2 bg-transparent w-[65%] sm:w-[50%] md:w-[45%] outline-0 text-white
                                border-[1px] border-white rounded-xl
                                focus:border-dotted lg:ml-12"
                                placeholder="Ingrese su contraseña"
                                { ...register("passwordLogin", {
                                    required: "Campo incompleto"
                                }) }
                                />
                            {errors.passwordLogin?.type && <span className="text-orange font-custom font-medium text-xs mt-2 lg:ml-12 xl:absolute xl:left-[47%] xl:bottom-[4px]">{errors.passwordLogin.message}</span>}
                            {loginError === "password incorrect" ? <span className="text-orange font-custom font-medium text-xs mt-2 lg:ml-12 xl:absolute xl:left-[47%] xl:bottom-[4px]">Contraseña Incorrecta</span> : <></>}
                        </div>
                    </>
                    :   //register inputs
                    <>
                        <div className="w-full flex flex-col xl:flex-row items-center lg:items-start relative">
                            <input 
                            type="text"
                            autoComplete="off"
                            onFocus={() => setLoginError("")}
                            className="p-2 bg-transparent w-[65%] md:w-[45%] outline-0 text-white
                            border-[1px] border-white rounded-xl
                            focus:border-dotted lg:ml-12"
                            placeholder="Ingrese su nombre"
                            { ...register("nombre", {
                                required: "Campo incompleto",
                                validate: (value) => {
                                    const val = value.trim().split(" ");
                                    return val.length === 1 || "Debe ingresar solo un valor (sin espacios)";
                                }
                            }) }
                            />
                            {errors.nombre?.type && <span className="text-orange font-custom font-medium text-xs mt-2 lg:ml-12 xl:absolute xl:left-[47%] xl:bottom-[4px]">{errors.nombre.message}</span>}
                        </div>

                        <div className="w-full flex flex-col items-center lg:items-start relative">
                            <input 
                            type="text"
                            autoComplete="off"
                            onFocus={() => setLoginError("")}
                            className="p-2 bg-transparent w-[65%] md:w-[45%] outline-0 text-white
                            border-[1px] border-white rounded-xl
                            focus:border-dotted lg:ml-12"
                            placeholder="Ingrese su apellido"
                            { ...register("apellido", {
                                required: "Campo incompleto",
                                validate: (value) => {
                                    const val = value.trim().split(" ");
                                    return val.length === 1 || "Debe ingresar solo un valor (sin espacios)";
                                }
                            }) }
                            />
                            {errors.apellido?.type && <span className="text-orange font-custom font-medium text-xs mt-2 lg:ml-12 xl:absolute xl:left-[47%] xl:bottom-[4px]">{errors.apellido.message}</span>}
                        </div>

                        <div className="w-full flex flex-col items-center lg:items-start relative">
                            <input
                            type="email"
                            autoComplete="off"
                            onFocus={() => setLoginError("")}
                            className="p-2 bg-transparent w-[65%] md:w-[45%] outline-0 text-white
                            border-[1px] border-white rounded-xl
                            focus:border-dotted lg:ml-12"
                            placeholder="Ingrese su email" 
                            { ...register("email", {
                                required: "Campo incompleto",
                                pattern: {
                                    value: /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/,
                                    message: "Email no válido"
                                }
                            }) }
                            />
                            {errors.email?.type && <span className="text-orange font-custom font-medium text-xs mt-2 lg:ml-12 xl:absolute xl:left-[47%] xl:bottom-[4px]">{errors.email.message}</span>}
                        </div>

                        <div className="w-full flex flex-col items-center lg:items-start relative">
                            <input 
                            type="text"
                            autoComplete="off"
                            onFocus={() => setLoginError("")}
                            className="p-2 bg-transparent w-[65%] md:w-[45%] outline-0 text-white
                            border-[1px] border-white rounded-xl
                            focus:border-dotted lg:ml-12"
                            placeholder="Ingrese su número de celular"
                            { ...register("phone", {
                                required: "Campo incompleto",
                                validate: (value) => {
                                    return value.length === 10 || "Numero de celular no valido";
                                }
                            }) }
                            />
                            {errors.phone?.type && <span className="text-orange font-custom font-medium text-xs mt-2 lg:ml-12 xl:absolute xl:left-[47%] xl:bottom-[4px]">{errors.phone.message}</span>}
                        </div>

                        <div className="w-full flex flex-col items-center lg:items-start relative">
                            <input
                            type="password"
                            autoComplete="off"
                            onFocus={() => setLoginError("")}
                            className="p-2 bg-transparent w-[65%] md:w-[45%] outline-0 text-white
                            border-[1px] border-white rounded-xl
                            focus:border-dotted lg:ml-12"
                            placeholder="Ingrese su contraseña" 
                            { ...register("password", {
                                required: "Campo incompleto",
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)([A-Za-z\d]|[^ ]){8,15}$/,
                                    message: "Contraseña débil"
                                }
                            }) }
                            />
                            {errors.password?.type && <span className="text-orange font-custom font-medium text-xs mt-2 lg:ml-12 xl:absolute xl:left-[47%] xl:bottom-[4px]">{errors.password.message}</span>}
                        </div>

                        <div className="w-full flex flex-col items-center lg:items-start relative">
                            <input
                            type="password"
                            autoComplete="off"
                            onFocus={() => setLoginError("")}
                            className="p-2 bg-transparent w-[65%] md:w-[45%] outline-0 text-white
                            border-[1px] border-white rounded-xl
                            focus:border-dotted lg:ml-12"
                            placeholder="Confirmar contraseña" 
                            { ...register("confirmPassword", {
                                required: "Campo incompleto",
                                validate: (value) => {
                                    return value === watch("password") || "Las contraseñas no coinciden";
                                }
                            }) }
                            />
                            {errors.confirmPassword?.type && <span className="text-orange font-custom font-medium text-xs mt-2 lg:ml-12 xl:absolute xl:left-[47%] xl:bottom-[4px]">{errors.confirmPassword.message}</span>}
                        </div>
                    </>
                }
                </div>
                

                <div className="w-full flex justify-center lg:justify-start xl:relative">
                    <button type="submit"       //BOTON DE SUBMIT
                    className="bg-orange w-[30%] sm:w-[20%] md:w-[15%] lg:w-[25%] 2xl:w-[20%] rounded-md py-1
                    text-black font-medium font-poppins lg:ml-12">
                        { login ? "LOGIN" : "REGISTRATE" }
                    </button>
                    {loginError === "user already exists" ? <span className="text-orange font-custom font-medium text-xs xl:text-base mt-2 lg:ml-12 xl:absolute xl:left-[27%] xl:bottom-[4px]">Usuario ya registrado</span> : <></>}
                </div>

                <div className="w-full flex flex-col justify-center items-center 2xl:flex 2xl:flex-col 2xl:items-center xl:absolute xl:bottom-[10%]">  
                    <hr className="border-white mt-6 w-[75%] mx-auto" />
                    <div className="w-[80%] my-8 xl:my-2 flex flex-col">     {/* //FOOTER FORM  */}
                        <div className="flex flex-col xl:flex-row items-center xl:justify-between mt-4 gap-2">
                            <span className="text-white ml-3 2xl:ml-5">
                                { login ? "NO TIENES UNA CUENTA?" : "YA TIENES UNA CUENTA?" }    
                            </span>
                            <div className="text-white mr-3 2xl:mr-5">
                                <button onClick={handleAuth}>
                                    { login ? "REGISTRAR" : "LOGIN" } 
                                    <FaArrowRight className="inline-block" id="icon-back"/>
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