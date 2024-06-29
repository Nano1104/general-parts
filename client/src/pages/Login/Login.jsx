import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useSignin from "../../hooks/useSingin.js"
import "./login.css"

export const Login = () => {
    const { signIn } = useSignin()
    const navigate = useNavigate();
    const [values, setValues] = useState({ email: "", password: "" })

    const handleNavigate = () => {
        navigate(-1);
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signIn(values)
            alert("Login success")
            navigate(-1);
        } catch (err) {
            alert(err.message)
        }
    }
    
    return(
        <>
        <div className="h-[100vh] w-full overflow-hidden" id="login-container">
            <form action="post" id="form" className="" onSubmit={handleSubmit}>
                <div className="flex flex-col justify-center items-center gap-3 mt-5">
                    <input type="email" className="w-[20%] rounded-md py-1 px-2" placeholder="Ingrese su email" required
                    onChange={ (e) => { setValues({ ...values, email: e.target.value })} }/>

                    <input type="password" className="w-[20%] rounded-md py-1 px-2" placeholder="Ingrese su contraseña" required
                    onChange={ (e) => { setValues({ ...values, password: e.target.value })} }/>

                    <button type="submit" className="py-2 px-4 mt-4 bg-red text-center text-white rounded-md w-[8%]">LOGIN</button>
                    <button onClick={handleNavigate} className="py-2 px-4 bg-red text-center text-white rounded-md w-[8%]">VOLVER</button>
                </div>
            </form>
        </div>
        </>
    )
}