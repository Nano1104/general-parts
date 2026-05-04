

export default function UserDetailAdmin({ user, onAccept, onDeny, onDelete, onDiscountChange }) {
    if (!user) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Seleccioná un usuario para ver sus datos
            </div>
        );
    }

    const isActive = user.accepted === true;

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

            {/* Descuentos — igual que antes */}
            <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">Descuentos</p>
                {/* acá va tu componente de descuentos existente */}
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