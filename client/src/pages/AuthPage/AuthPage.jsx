import { useState } from "react";
import { Link } from "react-router-dom";
import useSignin from "../../hooks/useSingin.js"
import { useAuthContext } from "../../context/AuthContext.jsx";

import Swal from 'sweetalert2';

import { FaArrowRight } from "react-icons/fa6";     //icons
import "./authpage.css"

export const AuthPage = () => {
    const { signIn } = useSignin()
    const [values, setValues] = useState({ email: "", password: "" })
    const [login, setLogin] = useState(true)
    
    const handleAuth = () => {
        setLogin(login => !login);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signIn(values)
            Swal.fire({
                title: "Sesion Iniciada!",
                icon: "success",
                confirmButtonColor: "#DC5F00",
                backdrop: true
              });
        } catch (err) {
            console.log("🚀 ~ handleSubmit ~ err:", err)
            Swal.fire({
                title: "Error",
                text: "Revisa los valores ingresados en los campos",
                icon: "error",
                confirmButtonColor: "#DC5F00",
                backdrop: true
              });
        }
    }
    
    return(
        <>
        <div className="h-[100vh] w-full overflow-hidden relative" id="login-container">
            <div id="bg-login" className="relative"></div>
            <Link to="/" className="absolute top-0 my-7 ml-10">
                <span className="font-extrabold text-orange font-poppins tracking-tighter italic text-[8rem]">SW</span>
                <span className="font-bold text-white font-poppins tracking-tight italic text-[8rem]">Parts</span>
            </Link>
            <form 
                action="post"
                id="form"
                className="flex flex-col justify-start items-start gap-4
                bg-[#272829] w-[800px] h-[650px] rounded-tl-[50px] rounded-bl-[50px]
                border-4 border-white border-double border-r-0 font-poppins relative"
                onSubmit={handleSubmit}
            >
                <h3 className="text-white text-[3rem] mt-12 ml-12 font-roboto">
                    { login ? "INCIAR SESIÓN" : "REGISTRATE" }
                </h3>
                {
                    login
                    ?
                    <>
                    <input 
                    type="email"
                    className="p-2 bg-transparent w-[45%] outline-0 text-white
                    border-[1px] border-white rounded-xl
                    focus:border-dotted ml-12"
                    placeholder="Ingrese su email"
                    onChange={ (e) => {setValues({ ...values, email: e.target.value })} }
                    required/>

                    <input
                    type="password"
                    className="p-2 bg-transparent w-[45%] outline-0 text-white
                    border-[1px] border-white rounded-xl
                    focus:border-dotted ml-12"
                    placeholder="Ingrese su contraseña" 
                    onChange={ (e) => {setValues({ ...values, password: e.target.value })} }
                    required/>
                    </>
                    :
                    <>
                    <input 
                    type="text"
                    className="p-2 bg-transparent w-[45%] outline-0 text-white
                    border-[1px] border-white rounded-xl
                    focus:border-dotted ml-12"
                    placeholder="Ingrese su nombre y apellido"
                    onChange={ (e) => {setValues({ ...values, email: e.target.value })} }
                    required/>

                    <input
                    type="email"
                    className="p-2 bg-transparent w-[45%] outline-0 text-white
                    border-[1px] border-white rounded-xl
                    focus:border-dotted ml-12"
                    placeholder="Ingrese su email" 
                    onChange={ (e) => {setValues({ ...values, password: e.target.value })} }
                    required/>

                    <input 
                    type="text"
                    className="p-2 bg-transparent w-[45%] outline-0 text-white
                    border-[1px] border-white rounded-xl
                    focus:border-dotted ml-12"
                    placeholder="Ingrese su número teléfono"
                    onChange={ (e) => {setValues({ ...values, email: e.target.value })} }
                    required/>

                    <input
                    type="password"
                    className="p-2 bg-transparent w-[45%] outline-0 text-white
                    border-[1px] border-white rounded-xl
                    focus:border-dotted ml-12"
                    placeholder="Ingrese su contraseña" 
                    onChange={ (e) => {setValues({ ...values, password: e.target.value })} }
                    required/>
                    </>
                }
                

                <button type="submit"       //BOTON DE SUBMIT
                className="bg-orange w-[18%] rounded-md py-1
                text-black font-medium font-poppins ml-12 mt-4">
                    { login ? "LOGIN" : "REGISTRATE" }
                </button>

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