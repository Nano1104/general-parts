import { useState } from "react";
import { Link } from "react-router-dom";
import useSignup from "../../hooks/useSigup.js"
import useSignin from "../../hooks/useSingin.js"
import { useAuthContext } from "../../context/AuthContext.jsx";

import Swal from 'sweetalert2';
import { useForm } from "react-hook-form"

//icons
import { FaArrowRight } from "react-icons/fa6";     //icons
import "./authpage.css"

export const AuthPage = () => {
    const { signIn } = useSignin()
    const { signUp } = useSignup()
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [login, setLogin] = useState(true)
    const [loginError, setLoginError] = useState("")
    console.log(errors)

    
    const handleAuth = () => {
        setLoginError("")
        setLogin(login => !login)
    };
    const onSubmit = handleSubmit(async (data) => {
        try {
            if(login) {
                const res = await signIn({email: data.emailLogin, password: data.passwordLogin})
                console.log("🚀 ~ onSubmit ~ res:", res)
            } else {
                const res = await signUp({first_name: data.nombre, last_name: data.apellido, email: data.email, phone: data.phone, password: data.password})
                console.log(res) 
            }
        } catch (err) {
            console.log(err)
            setLoginError(err.message)
        }
    })
     
    return(
        <>
        <div className="min-h-screen w-full overflow-hidden relative" id="login-container">
            <div id="bg-login" className="relative"></div>
            <Link to="/" className="absolute top-0 my-7 ml-10">
                <span className="font-extrabold text-orange font-poppins tracking-tighter italic text-[8rem]">SW</span>
                <span className="font-bold text-white font-poppins tracking-tight italic text-[8rem]">Parts</span>
            </Link>

            <form
                key={login ? "login" : "register"} 
                action="post"
                id="form"
                className="flex flex-col justify-start items-start gap-4
                bg-[#272829] w-[800px] h-[650px] rounded-tl-[50px] rounded-bl-[50px]
                border-4 border-white border-double border-r-0 font-poppins relative"
                onSubmit={onSubmit}
            >
                <h3 className="text-white text-[3rem] mt-12 ml-12 font-roboto">
                    { login ? "INCIAR SESIÓN" : "REGISTRATE" }
                </h3>

                { login 
                    ?   //login inputs
                    <>
                        <div className="w-full relative">
                            <input 
                                type="email"
                                autoComplete="off"
                                onFocus={() => setLoginError("")}
                                className="p-2 bg-transparent w-[45%] outline-0 text-white
                                border-[1px] border-white rounded-xl
                                focus:border-dotted ml-12"
                                placeholder="Ingrese su email"
                                { ...register("emailLogin", {
                                    required: "Campo incompleto"
                                }) }
                            />
                            {errors.emailLogin?.type && <span className="text-orange font-custom font-medium text-xs ml-2 absolute bottom-[4px]">{errors.emailLogin.message}</span>}
                            {loginError === "User does not exist" ? <span className="text-orange font-custom font-medium text-xs ml-2 absolute bottom-[4px]">No existe usuario con este mail</span> : <></>}
                        </div>

                        <div className="w-full relative">
                            <input 
                                type="password"
                                autoComplete="off"
                                onFocus={() => setLoginError("")}
                                className="p-2 bg-transparent w-[45%] outline-0 text-white
                                border-[1px] border-white rounded-xl
                                focus:border-dotted ml-12"
                                placeholder="Ingrese su contraseña"
                                { ...register("passwordLogin", {
                                    required: "Campo incompleto"
                                }) }
                                />
                            {errors.passwordLogin?.type && <span className="text-orange font-custom font-medium text-xs ml-2 absolute bottom-[4px]">{errors.passwordLogin.message}</span>}
                            {loginError === "password incorrect" ? <span className="text-orange font-custom font-medium text-xs ml-2 absolute bottom-[4px]">Contraseña Incorrecta</span> : <></>}
                        </div>
                    </>
                    :   //register inputs
                    <>
                        <div className="w-full relative">
                            <input 
                            type="text"
                            autoComplete="off"
                            onFocus={() => setLoginError("")}
                            className="p-2 bg-transparent w-[45%] outline-0 text-white
                            border-[1px] border-white rounded-xl
                            focus:border-dotted ml-12 inline-block"
                            placeholder="Ingrese su nombre"
                            { ...register("nombre", {
                                required: "Campo incompleto",
                                validate: (value) => {
                                    const val = value.trim().split(" ");
                                    return val.length === 1 || "Debe ingresar solo un valor (sin espacios)";
                                }
                            }) }
                            />
                            {errors.nombre?.type && <span className="text-orange font-custom font-medium text-xs ml-2 absolute bottom-[4px]">{errors.nombre.message}</span>}
                        </div>

                        <div className="w-full relative">
                            <input 
                            type="text"
                            autoComplete="off"
                            onFocus={() => setLoginError("")}
                            className="p-2 bg-transparent w-[45%] outline-0 text-white
                            border-[1px] border-white rounded-xl
                            focus:border-dotted ml-12"
                            placeholder="Ingrese su apellido"
                            { ...register("apellido", {
                                required: "Campo incompleto",
                                validate: (value) => {
                                    const val = value.trim().split(" ");
                                    return val.length === 1 || "Debe ingresar solo un valor (sin espacios)";
                                }
                            }) }
                            />
                            {errors.apellido?.type && <span className="text-orange font-custom font-medium text-xs ml-2 absolute bottom-[4px]">{errors.apellido.message}</span>}
                        </div>

                        <div className="w-full relative">
                            <input
                            type="email"
                            autoComplete="off"
                            onFocus={() => setLoginError("")}
                            className="p-2 bg-transparent w-[45%] outline-0 text-white
                            border-[1px] border-white rounded-xl
                            focus:border-dotted ml-12"
                            placeholder="Ingrese su email" 
                            { ...register("email", {
                                required: "Campo incompleto",
                                pattern: {
                                    value: /^(([^<>()\[\]\\.,;:\s@”]+(\.[^<>()\[\]\\.,;:\s@”]+)*))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/,
                                    message: "Email no válido"
                                }
                            }) }
                            />
                            {errors.email?.type && <span className="text-orange font-custom font-medium text-xs ml-2 absolute bottom-[4px]">{errors.email.message}</span>}
                        </div>

                        <div className="w-full relative">
                            <input 
                            type="text"
                            autoComplete="off"
                            onFocus={() => setLoginError("")}
                            className="p-2 bg-transparent w-[45%] outline-0 text-white
                            border-[1px] border-white rounded-xl
                            focus:border-dotted ml-12"
                            placeholder="Ingrese su número de celular"
                            { ...register("phone", {
                                required: "Campo incompleto",
                                validate: (value) => {
                                    return value.length === 10 || "Numero de celular no valido";
                                }
                            }) }
                            />
                            {errors.phone?.type && <span className="text-orange font-custom font-medium text-xs ml-2 absolute bottom-[4px]">{errors.phone.message}</span>}
                        </div>

                        <div className="w-full relative">
                            <input
                            type="password"
                            autoComplete="off"
                            onFocus={() => setLoginError("")}
                            className="p-2 bg-transparent w-[45%] outline-0 text-white
                            border-[1px] border-white rounded-xl
                            focus:border-dotted ml-12"
                            placeholder="Ingrese su contraseña" 
                            { ...register("password", {
                                required: "Campo incompleto",
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)([A-Za-z\d]|[^ ]){8,15}$/,
                                    message: "Contraseña débil"
                                }
                            }) }
                            />
                            {errors.password?.type && <span className="text-orange font-custom font-medium text-xs ml-2 absolute bottom-[4px]">{errors.password.message}</span>}
                        </div>

                        <div className="w-full relative">
                            <input
                            type="password"
                            autoComplete="off"
                            onFocus={() => setLoginError("")}
                            className="p-2 bg-transparent w-[45%] outline-0 text-white
                            border-[1px] border-white rounded-xl
                            focus:border-dotted ml-12"
                            placeholder="Confirmar contraseña" 
                            { ...register("confirmPassword", {
                                required: "Campo incompleto",
                                validate: (value) => {
                                    return value === watch("password") || "Las contraseñas no coinciden";
                                }
                            }) }
                            />
                            {errors.confirmPassword?.type && <span className="text-orange font-custom font-medium text-xs ml-2 absolute bottom-[4px]">{errors.confirmPassword.message}</span>}
                        </div>
                    </>
                }
                

                <div className="w-full">
                    <button type="submit"       //BOTON DE SUBMIT
                    className="bg-orange w-[18%] rounded-md py-1
                    text-black font-medium font-poppins ml-12">
                        { login ? "LOGIN" : "REGISTRATE" }
                    </button>
                    {loginError === "user already exists" ? <span className="text-orange font-poppins font-medium text-base ml-4 top-[20px] bottom-[4px]">Usuario ya registrado</span> : <></>}
                </div>

                <div className="" id="footer-form">     {/* //FOOTER FORM  */}
                    <hr className="text-white" />
                    <span className="absolute top-0 left-0 m-5 text-white">
                        { login ? "NO TIENES UNA CUENTA?" : "YA TIENES UNA CUENTA?" }    
                    </span>
                    <div className="absolute top-0 right-0 m-5 text-white" id="btn-back">
                        <button onClick={handleAuth}>
                            { login ? "REGISTRAR" : "LOGIN" } 
                            <FaArrowRight className="inline-block" id="icon-back"/>
                        </button>
                    </div>
                </div>
            </form>
        </div>
        </>
    )
}