
export const UserManage = () => {
    return(
        <>
        <h2 className="text-2xl font-poppins font-bold mb-4">USUARIOS</h2>
        <div>
            <h3>VER USUARIOS</h3>
            <button className="bg-orange w-[15%] rounded-md py-1 text-gray font-medium font-poppins" type="submit">VER LISTA DE USUARIOS</button>
        </div>
        <hr className="my-4 w-[20%]" />
        <div className="flex flex-col">
            <h3>MODIFICAR USUARIO</h3>
            <input type="text" placeholder="Ingresar ID del usuario" className="w-[15%] py-1 px-2 my-2" />
            <button className="bg-orange w-[15%] rounded-md py-1 text-gray font-medium font-poppins" type="submit">MODIFICAR USUARIO</button>
        </div>
        </>
    )
}