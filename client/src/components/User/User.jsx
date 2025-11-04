import axios from 'axios';
import { API_URL } from '../../utils/api_url';
import Swal from 'sweetalert2'
import { useState } from 'react';

export const User = ({ userData, onDiscountChange }) => {
  const {
    _id, cart, email, first_name, last_connection, last_name,
    city, cuit, phone, role, accepted,
    discount_1, discount_2, discount_3
  } = userData;

  const [editField, setEditField] = useState(null);
  const [newDiscount, setNewDiscount] = useState("");

  const copyId = () => {
    navigator.clipboard.writeText(_id);
    Swal.fire({
      title: "Código copiado",
      confirmButtonColor: "#D7263D"
    });
  };

  const handleEdit = (field, currentValue) => {
    setEditField(field);
    setNewDiscount(currentValue);
  };

  const handleCancel = () => {
    setEditField(null);
    setNewDiscount("");
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API_URL}/api/user/change-discount/${_id}`, {
        field: editField,
        value: Number(newDiscount)
      }, { withCredentials: true });

      // 🔹 Actualiza el estado local en UserManage
      onDiscountChange(_id, editField, Number(newDiscount));

      Swal.fire({
        icon: "success",
        title: "Descuento actualizado",
        confirmButtonColor: "#D7263D"
      });

      // 🔹 Cerramos el modo edición
      setEditField(null);
      setNewDiscount("");
    } catch (error) {
      console.error("Error al actualizar descuento:", error);
      Swal.fire({
        icon: "error",
        title: "Error al actualizar descuento",
        confirmButtonColor: "#D7263D"
      });
    }
  };

  const renderDiscount = (field, label, value) => (
    <div className="mt-1 flex items-center gap-2">
      <span className="font-bold">{label}: </span>
      {editField === field ? (
        <>
          <input
            type="number"
            value={newDiscount}
            onChange={(e) => setNewDiscount(e.target.value)}
            className="w-16 p-1 rounded border border-gray-300"
          />
          <button onClick={handleSave} className="bg-lightRed text-white text-sm px-2 py-1 rounded">
            Guardar
          </button>
          <button onClick={handleCancel} className="bg-deepGray text-white text-sm px-2 py-1 rounded">
            Cancelar
          </button>
        </>
      ) : (
        <>
          <span className="font-normal">{value}%</span>
          <button
            onClick={() => handleEdit(field, value)}
            className="border bg-cWhite text-black px-2 py-1 rounded text-xs"
          >
            Editar
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="p-3 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="font-bold">
          Id Usuario: <span className="ml-2 font-normal">{_id}</span>
        </span>
        <button
          onClick={copyId}
          className="bg-lightRed w-[20%] rounded-md py-1 text-sm text-cWhite font-medium font-poppins"
        >
          Copiar Código
        </button>
      </div>

      <span className="font-bold">Nombre: <span className="ml-2 font-normal">{first_name}</span></span>
      <span className="font-bold">Apellido: <span className="ml-2 font-normal">{last_name}</span></span>
      <span className="font-bold">Email: <span className="ml-2 font-normal">{email}</span></span>
      <span className="font-bold">Ciudad/Partido: <span className="ml-2 font-normal">{city}</span></span>
      <span className="font-bold">N° Carrito: <span className="ml-2 font-normal">{cart}</span></span>
      <span className="font-bold">Teléfono/celular: <span className="ml-2 font-normal">{phone}</span></span>
      <span className="font-bold">CUIT: <span className="ml-2 font-normal">{cuit}</span></span>
      <span className="font-bold">Rol: <span className="ml-2 font-normal">{role}</span></span>
      <span className="font-bold">
        Usuario de alta: <span className="ml-2 font-bold text-red">{accepted ? "SI" : "NO"}</span>
      </span>
      <span className="font-bold">Última conexión: <span className="ml-2 font-normal">{last_connection}</span></span>
      {renderDiscount("discount_1", "Descuento °1", discount_1)}
      {renderDiscount("discount_2", "Descuento °2", discount_2)}
      {renderDiscount("discount_3", "Descuento °3", discount_3)}
      <hr className="w-[80%] mt-4" />
    </div>
  );
};
