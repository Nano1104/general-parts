import { useEffect } from "react";

export default function UserDropdown({ label, users, selectedId, onSelect }) {

    // Si queda un solo usuario y no está seleccionado → seleccionarlo automáticamente
    useEffect(() => {
        if (users.length === 1 && selectedId !== users[0]._id) {
            onSelect(users[0]._id);
        }
    }, [users]);  // se re-ejecuta cuando la lista cambia

    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {label}
                <span className="ml-2 bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                    {users.length}
                </span>
            </label>
            <select
                className="w-full rounded-md border border-gray-300 py-1.5 px-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-lightRed/40
                           disabled:bg-gray-50 disabled:text-gray-400"
                value={selectedId ?? ""}
                onChange={(e) => onSelect(e.target.value)}
                disabled={users.length === 0}
            >
                <option value="" disabled>
                    {users.length === 0 ? "Sin usuarios" : "Seleccionar usuario..."}
                </option>
                {users.map((u) => (
                    <option key={u._id} value={u._id}>
                        {u.first_name} {u.last_name} — {u.email}
                    </option>
                ))}
            </select>
        </div>
    );
}