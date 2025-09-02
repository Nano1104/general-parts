
export const User = ({userData}) => {
    const { _id, cart, email, first_name, last_connection, last_name, city, cuit, phone, role, accepted } = userData;
    console.log("🚀 ~ User ~ accepted:", accepted)

    return(
        <>
            <div key={`user-div-${_id}`} className="p-3 flex flex-col">
                <span className="font-bold">Id Usuario: <span className="ml-2 font-normal">{_id}</span></span>
                <span className="font-bold">Nombre: <span className="ml-2 font-normal">{first_name}</span></span>
                <span className="font-bold">Apellido: <span className="ml-2 font-normal">{last_name}</span></span>
                <span className="font-bold">Email: <span className="ml-2 font-normal">{email}</span></span>
                <span className="font-bold">Ciudad/Partido: <span className="ml-2 font-normal">{city}</span></span>
                <span className="font-bold">N° Carrito: <span className="ml-2 font-normal">{cart}</span></span>
                <span className="font-bold">Telefono/celular: <span className="ml-2 font-normal">{phone}</span></span>
                <span className="font-bold">CUIT: <span className="ml-2 font-normal">{cuit}</span></span>
                <span className="font-bold">Rol: <span className="ml-2 font-normal">{role}</span></span>
                <span className="font-bold">Usuario de alta: <span className="ml-2 font-bold text-red">{accepted ? "SI" : "NO" }</span></span>
                <span className="font-bold">Ultima conexión: <span className="ml-2 font-normal">{last_connection}</span></span>
                <hr className="w-[80%]" />
            </div>
        </>
    )
}