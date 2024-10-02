import axios from "axios";
import Swal from 'sweetalert2';
import { useEffect, useState } from "react"
import { User } from "../User/User.jsx";

export const UserManage = () => {
    const [users, setUsers] = useState([])

    const handleGetUsers = async () => {
        try {
            const res = await axios.get("/api/user", { withCredentials: true })
            setUsers([...res.data.users])
        } catch (err) {
            console.log(err.message)
        }
    }

    const handleDeleteUser = async (e) => {
        e.preventDefault()
        try {
            const res = await axios.delete(`/api/user/${e.target.prodId.value}`, { withCredentials: true })
            console.log(res)
            await handleGetUsers()

            if(res.status == 200) {
                Swal.fire({
                    title: "Usuario Eliminado!",
                    icon: "success",
                    confirmButtonColor: "#DC5F00",
                    backdrop: true
                });
            } 
        } catch (err) {
            Swal.fire({
                title: "Error",
                text: "Id ingresado puedo ser incorrecto",
                icon: "error",
                confirmButtonColor: "#DC5F00",
                backdrop: true
            });
            console.log(err)
        }
    }

    const handleUpdateUser = async (e) => {
        try {
            
        } catch (err) {
            console.log(err)
        }
    }
        
    useEffect(() => { }, [users])

    return(
        <>
        <div className="px-5 h-full flex">
           <div className="basis-[50%]">
            <h2 className="text-[2rem] font-poppins font-bold mb-3">USUARIOS</h2>
                <div>
                    <h3 className="font-medium">VER USUARIOS</h3>
                    <button className="bg-orange w-[30%] rounded-md py-1 text-sm text-lightGray font-medium font-poppins" type="submit" onClick={handleGetUsers}>Ver lista de usuarios</button>
                </div>
                <hr className="my-4 w-[45%] ml-2" />
                <div className="flex flex-col">
                    <h3 className="font-medium">BORRAR USUARIO DE LA BASE DE DATOS</h3>
                    <form action="" className="flex flex-col text-sm" onSubmit={handleDeleteUser}>
                        <input type="text" name="prodId" placeholder="Ingresar ID del usuario" className="w-[30%] rounded-md py-1 px-2 my-2" />
                        <button className="bg-orange w-[30%] rounded-md py-1 text-sm text-lightGray font-medium font-poppins" type="submit">Borrar usuario</button>
                    </form>
                </div>
                <hr className="my-4 w-[45%] ml-2" />
                <div className="flex flex-col">
                    <h3 className="font-medium">MODIFICAR USUARIO</h3>
                    <form action="" className="flex flex-col text-sm" onSubmit={handleUpdateUser}>
                        <div>
                            <label className="font-medium">Id del producto:</label><input type="text" placeholder="Ingresar ID del usuario" className="w-[30%] rounded-md py-1 px-2 my-2 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Email:</label><input type="text" placeholder="Nuevo email" className="w-[30%] rounded-md py-1 px-2 my-2 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Telofono/celular</label><input type="text" placeholder="Nuevo Telofono/celular" className="w-[30%] rounded-md py-1 px-2 my-2 ml-2" />
                        </div>
                        <div>
                            <label className="font-medium">Rol</label><input type="text" placeholder="Nuevo rol" className="w-[30%] rounded-md py-1 px-2 my-2 ml-2" />
                        </div>
                        <button className="bg-orange w-[30%] rounded-md py-1 text-sm text-lightGray font-medium font-poppins" type="submit">Modificar usuario</button>
                    </form>
                </div>
                <hr className="my-4 w-[45%] ml-2" />
           </div>

           <div className="basis-[50%] overflow-y-auto border-l">
                <div>
                    {
                        users.map(user => <User userData={user} />)
                    }
                </div>
           </div>
        </div>
        </>
    )
}