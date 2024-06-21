import { useState } from "react";
import useSignup from "../../hooks/useSigup";
import bgRegister from "../../images/bg-register.avif"
import "./register.css"

export const Register = () => {
    const { signUp } = useSignup();
    const [values, setValues] = useState({ first_name: "", last_name: "", email: "", phone: "", password: "" })

    const handleInputChange = (e) => {
        const fullName = e.target.value;
        setValues({ ...values, full_name: fullName });

        // Separar nombre y apellido si hay un espacio
        const splitName = fullName.split(' ');
        if (splitName.length > 1) {
            setValues({
                ...values,
                first_name: splitName[0],
                last_name: splitName.slice(1).join(' ') // Unir el resto como el apellido
            });
        } else {
            setValues({ ...values, first_name: fullName, last_name: '' });
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signUp(values)
    }

    return(
        <>
        <div className="h-[100vh] w-full overflow-hidden" id="register-container">
            <form action="post" id="form" className="" onSubmit={handleSubmit}>
                <div className="flex flex-col justify-center items-center gap-3 mt-5">
                    <input type="text" className="w-[20%] rounded-md py-1 px-2" placeholder="Escribe tu nombre y apellido" required
                    onChange={handleInputChange}/>

                    <input type="email" className="w-[20%] rounded-md py-1 px-2" placeholder="Escribe tu email" required
                    onChange={ (e) => { setValues({ ...values, email: e.target.value })} }/>

                    <input type="text" className="w-[20%] rounded-md py-1 px-2" placeholder="Escribe tu número teléfono" required
                    onChange={(e) => { setValues({ ...values, phone: e.target.value }) }}/>

                    <input type="password" className="w-[20%] rounded-md py-1 px-2" placeholder="Escribe tu contraseña" required
                    onChange={ (e) => { setValues({ ...values, password: e.target.value })} }/>

                    <button type="submit" className="py-2 px-4 m-4 bg-red text-center text-white rounded-md w-[8%]">REGISTRAR</button>
                </div>
            </form>
        </div>
        </>
    )
}