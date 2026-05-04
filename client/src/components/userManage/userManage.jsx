import { useState, useEffect, useCallback, useMemo } from "react";
import Swal from "sweetalert2";
import { userService } from "../../services/user.service.js";
import UserDropdown from "../UserDropdown.jsx";
import UserDetail from "../UserDetailAdmin.jsx";

const confirm = (text) =>
    Swal.fire({
        title: "Confirmar acción",
        text,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#D7263D",
        cancelButtonColor: "#BDC3C7",
        confirmButtonText: "Sí, continuar",
        cancelButtonText: "Cancelar",
    });

export const UserManage = () => {
    const [users, setUsers] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);

    // ─── Derived state — sin useState extra, se recalcula solo ───────────
    // ✅ Después — campo real de tu DB
    const activeUsers = useMemo(() => users.filter(u => u.accepted === true), [users]);
    const inactiveUsers = useMemo(() => users.filter(u => u.accepted === false), [users]);
    const selectedUser = useMemo(() => users.find(u => u._id === selectedId) ?? null, [users, selectedId]);

    // ─── Fetch inicial ────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await userService.getAll();
                setUsers(res.data.users);
            } catch {
                Swal.fire({
                    title: "Error", text: "No se pudieron cargar los usuarios",
                    icon: "error", confirmButtonColor: "#DC5F00"
                });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // ─── Mutaciones — todas optimistas, sin refetch ───────────────────────
    const handleAccept = useCallback(async (userId) => {
        const { isConfirmed } = await confirm("¿Dar de alta al usuario?");
        if (!isConfirmed) return;
        try {
            await userService.accept(userId);
            setUsers(prev => prev.map(u =>
                u._id === userId ? { ...u, accepted: true } : u  // ✅
            ));
            Swal.fire({ title: "Usuario aceptado", icon: "success", confirmButtonColor: "#D7263D" });
        } catch (err) {
            Swal.fire({ title: "Error", text: err.response?.data?.message, icon: "error", confirmButtonColor: "#DC5F00" });
        }
    }, []);

    const handleDeny = useCallback(async (userId) => {
        const { isConfirmed } = await confirm("¿Dar de baja al usuario?");
        if (!isConfirmed) return;
        try {
            await userService.deny(userId);
            setUsers(prev => prev.map(u =>
                u._id === userId ? { ...u, accepted: false } : u  // ✅
            ));
            Swal.fire({ title: "Usuario dado de baja", icon: "success", confirmButtonColor: "#D7263D" });
        } catch (err) {
            Swal.fire({ title: "Error", text: err.response?.data?.message, icon: "error", confirmButtonColor: "#DC5F00" });
        }
    }, []);

    const handleDelete = useCallback(async (userId) => {
        const { isConfirmed } = await confirm("Esta acción no se puede deshacer.");
        if (!isConfirmed) return;
        try {
            await userService.remove(userId);
            setUsers(prev => prev.filter(u => u._id !== userId));
            setSelectedId(null); // limpia el panel
            Swal.fire({ title: "Usuario eliminado", icon: "success", confirmButtonColor: "#D7263D" });
        } catch (err) {
            Swal.fire({ title: "Error", text: err.response?.data?.message, icon: "error", confirmButtonColor: "#DC5F00" });
        }
    }, []);

    const handleDiscountChange = useCallback(async (userId, field, value) => {
        setUsers(prev => prev.map(u =>
            u._id === userId ? { ...u, [field]: value } : u
        ));
        try {
            await userService.changeDiscount(userId, field, value);
        } catch {
            // revert optimistic update si falla
            setUsers(prev => prev.map(u =>
                u._id === userId ? { ...u, [field]: selectedUser?.[field] } : u
            ));
            Swal.fire({ title: "Error al cambiar descuento", icon: "error", confirmButtonColor: "#D7263D" });
        }
    }, [selectedUser]);

    return (
        <div className="px-5 h-full flex gap-6">
            {/* Columna izquierda */}
            <div className="basis-[50%] flex flex-col gap-6 pt-2">
                <h2 className="text-4xl font-montserrat tracking-tight font-bold">USUARIOS</h2>

                {loading ? (
                    <p className="text-sm text-gray-500">Cargando usuarios...</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        <UserDropdown
                            label="Usuarios de ALTA"
                            users={activeUsers}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                        />
                        <UserDropdown
                            label="Usuarios de BAJA"
                            users={inactiveUsers}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                        />
                    </div>
                )}
            </div>

            {/* Columna derecha */}
            <div className="basis-[50%] border-l pl-6">
                <UserDetail
                    user={selectedUser}
                    onAccept={handleAccept}
                    onDeny={handleDeny}
                    onDelete={handleDelete}
                    onDiscountChange={handleDiscountChange}
                />
            </div>
        </div>
    );
};