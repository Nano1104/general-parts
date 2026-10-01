import { useState, useEffect } from "react";

const DISCOUNT_FIELDS = [
    { field: "discount_1", label: "Descuento °1" },
    { field: "discount_2", label: "Descuento °2" },
    { field: "discount_3", label: "Descuento °3" },
];

export default function UserDetailAdmin({ user, onAccept, onDeny, onDelete, onDiscountChange, onResetPassword }) {
    const [editField, setEditField] = useState(null);
    const [newValue, setNewValue] = useState("");

    // Al cambiar de usuario seleccionado, salimos del modo edición
    useEffect(() => {
        setEditField(null);
        setNewValue("");
    }, [user?._id]);

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Seleccioná un usuario para ver sus datos
            </div>
        );
    }

    const isActive = user.accepted === true;

    const handleEdit = (field, currentValue) => {
        setEditField(field);
        setNewValue(currentValue ?? 0);
    };

    const handleCancel = () => {
        setEditField(null);
        setNewValue("");
    };

    const handleSave = () => {
        onDiscountChange(user._id, editField, Number(newValue));
        setEditField(null);
        setNewValue("");
    };

    return (
        <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto">
            {/* Datos del usuario */}
            <div className="space-y-1">
                <h3 className="font-bold text-lg">
                    {user.first_name} {user.last_name}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-600">{user.phone}</p>
                <p className="text-sm text-gray-600">{user.city}</p>
                <p className="text-sm text-gray-600">CUIT: {user.cuit}</p>
                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full
                    ${isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"}`}>
                    {isActive ? "Activo" : "Inactivo"}
                </span>
            </div>

            <hr />

            {/* Descuentos */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">Descuentos</p>
                <div className="space-y-1.5">
                    {DISCOUNT_FIELDS.map(({ field, label }) => (
                        <div key={field} className="flex items-center gap-2 text-sm">
                            <span className="font-medium">{label}:</span>
                            {editField === field ? (
                                <>
                                    <input
                                        type="number"
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                        className="w-16 p-1 rounded border border-gray-300 text-sm"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSave}
                                        className="bg-lightRed text-cWhite text-xs px-2 py-1 rounded"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="bg-deepGray text-cWhite text-xs px-2 py-1 rounded"
                                    >
                                        Cancelar
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="text-gray-600">{user[field] ?? 0}%</span>
                                    <button
                                        onClick={() => handleEdit(field, user[field])}
                                        className="border border-gray-300 bg-cWhite text-black px-2 py-0.5 rounded text-xs"
                                    >
                                        Editar
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <hr />

            {/* Acciones */}
            <div className="flex flex-col gap-2 mt-auto">
                {isActive ? (
                    <button
                        onClick={() => onDeny(user._id)}
                        className="w-full rounded-md py-1.5 text-sm font-medium bg-cBlack
                                   text-white hover:opacity-90 transition-opacity"
                    >
                        Dar de BAJA
                    </button>
                ) : (
                    <button
                        onClick={() => onAccept(user._id)}
                        className="w-full rounded-md py-1.5 text-sm font-medium bg-cBlack
                                   text-white hover:opacity-90 transition-opacity"
                    >
                        Dar de ALTA
                    </button>
                )}
                <button
                    onClick={() => onResetPassword(user._id)}
                    className="w-full rounded-md py-1.5 text-sm font-medium border border-gray-300
                               bg-cWhite text-black hover:opacity-90 transition-opacity"
                >
                    Cambiar contraseña
                </button>
                <button
                    onClick={() => onDelete(user._id)}
                    className="w-full rounded-md py-1.5 text-sm font-medium bg-lightRed
                               text-cWhite transition-colors"
                >
                    Eliminar usuario
                </button>
            </div>
        </div>
    );
}