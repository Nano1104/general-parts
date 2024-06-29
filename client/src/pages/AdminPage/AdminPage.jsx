import { useAuthContext } from "../../context/AuthContext.jsx";
import { Link } from "react-router-dom";

export const AdminPage = () => {
    const { authUser } = useAuthContext();

    return(
        <>
            <h1 className="text-3xl font-bold text-white text-center">Bienvenido {authUser.first_name}/Juan!</h1>
            <form action="" className="flex flex-col justify-center items-center gap-5 mt-10">
                <div className="flex items-center">
                    <input type="text" className="rounded-sm" /><button className="w-[50%] text-center bg-red text-white py-1 px-2 rounded-md">CAMBIAR PRECIO</button>
                </div>
                <div className="flex items-center">
                    <input type="text" className="rounded-sm" /><button className="w-[50%] text-center bg-red text-white py-1 px-2 rounded-md">AGREGAR IMPUESTO</button>
                </div>

                <Link to="/" className="py-2 px-4 bg-red text-center text-white rounded-md w-[8%]">VOLVER</Link>
            </form>
        </>
    )
}