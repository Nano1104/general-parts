import Swal from 'sweetalert2'


export const User = ({ userData }) => {
  const {
    _id, cart, email, first_name, last_connection, last_name,
    city, cuit, phone, role, accepted // 👈 viene del user que estás mostrando
  } = userData;

  const copyId = () => {
    navigator.clipboard.writeText(_id);
    Swal.fire({
      title: "Codigo copiado",
      confirmButtonColor: "#D7263D"
    });
  };

  return (
    <div className="p-3 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="font-bold">
          Id Usuario: <span className="ml-2 font-normal">{_id}</span>
        </span>
        <button onClick={copyId} className="bg-lightRed w-[20%] rounded-md py-1 text-sm text-cWhite font-medium font-poppins">
          Copiar Código
        </button>
      </div>

      <span className="font-bold">Nombre: <span className="ml-2 font-normal">{first_name}</span></span>
      <span className="font-bold">Apellido: <span className="ml-2 font-normal">{last_name}</span></span>
      <span className="font-bold">Email: <span className="ml-2 font-normal">{email}</span></span>
      <span className="font-bold">Ciudad/Partido: <span className="ml-2 font-normal">{city}</span></span>
      <span className="font-bold">N° Carrito: <span className="ml-2 font-normal">{cart}</span></span>
      <span className="font-bold">Telefono/celular: <span className="ml-2 font-normal">{phone}</span></span>
      <span className="font-bold">CUIT: <span className="ml-2 font-normal">{cuit}</span></span>
      <span className="font-bold">Rol: <span className="ml-2 font-normal">{role}</span></span>
      <span className="font-bold">
        Usuario de alta: <span className="ml-2 font-bold text-red">{accepted ? "SI" : "NO"}</span>
      </span>
      <span className="font-bold">Ultima conexión: <span className="ml-2 font-normal">{last_connection}</span></span>
      <hr className="w-[80%]" />
    </div>
  );
};
