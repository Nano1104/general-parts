// ─── RegisterFields ───────────────────────────────────────────────────────────
//
// CAMBIOS VISUALES vs original:
//   - inputBase definido una sola vez → sin repetición de 8+ clases por input
//   - Labels visibles encima de cada campo
//   - FieldSection: separador visual con título de grupo (mejora jerarquía visual)
//   - aria-invalid + aria-describedby + role="alert" en errores
//   - aria-label en el botón toggle de contraseña
//   - confirmPassword ahora full-width (queda más consistente con el diseño del form)
//
// LÓGICA: sin cambios. Todas las validaciones de register() son idénticas al original.
// FormLocalidades y CUITInput se usan igual — actualizá su styling interno si querés match.
// ─────────────────────────────────────────────────────────────────────────────

import { FormLocalidades } from "../FormLocalidades/FormLocalidades.jsx";
import { CUITInput } from "../CUITInput/CUITInput.jsx";

// Clases base — modificar acá para cambiar estilo global de todos los inputs.
const inputBase =
    "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 " +
    "text-zinc-900 text-sm placeholder-zinc-300 " +
    "focus:outline-none focus:bg-white focus:border-zinc-800 " +
    "transition-all duration-150";

const labelClass = "block text-[11px] font-bold text-zinc-400 uppercase tracking-[0.12em] mb-2";
const errorClass = "text-red-500 text-xs font-medium mt-1.5 block";

// ─── Separador de sección ─────────────────────────────────────────────────────
// Puramente visual — mejora la jerarquía sin cambiar nada del formulario.
const FieldSection = ({ label }) => (
    <div className="flex items-center gap-3 pt-1">
        <span className="text-[10px] font-bold text-black uppercase tracking-[0.18em] whitespace-nowrap">
            {label}
        </span>
        <div className="flex-1 h-px bg-black/20" aria-hidden="true" />
    </div>
);

// ─── SVG: ojo abierto ────────────────────────────────────────────────────────
const EyeOpen = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// ─── SVG: ojo cerrado ────────────────────────────────────────────────────────
const EyeClosed = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
);

// ─── Componente principal ─────────────────────────────────────────────────────
export default function RegisterFields({
    register,
    errors,
    watch,
    setValue,
    showPassword,
    onTogglePassword,
    localidades,
}) {
    return (
        <div className="space-y-5">

            {/* ── Datos personales ── */}
            <FieldSection label="Datos personales" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                    <label htmlFor="nombre" className={labelClass}>Nombre</label>
                    <input
                        id="nombre"
                        type="text"
                        autoComplete="off"
                        className={inputBase}
                        placeholder="Juan"
                        aria-invalid={!!errors.nombre}
                        aria-describedby={errors.nombre ? "nombre-error" : undefined}
                        {...register("nombre", {
                            required: "Campo incompleto",
                            validate: (value) => {
                                const trimmed = value.trim();
                                if (trimmed.split(" ").length > 1) return "Sin espacios";
                                if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+$/i.test(trimmed)) return "Solo letras";
                                return true;
                            },
                        })}
                    />
                    {errors.nombre && (
                        <span id="nombre-error" className={errorClass} role="alert">
                            {errors.nombre.message}
                        </span>
                    )}
                </div>

                {/* Apellido */}
                <div>
                    <label htmlFor="apellido" className={labelClass}>Apellido</label>
                    <input
                        id="apellido"
                        type="text"
                        autoComplete="off"
                        className={inputBase}
                        placeholder="Pérez"
                        aria-invalid={!!errors.apellido}
                        aria-describedby={errors.apellido ? "apellido-error" : undefined}
                        {...register("apellido", {
                            required: "Campo incompleto",
                            validate: (value) => {
                                const trimmed = value.trim();
                                if (trimmed.split(" ").length > 1) return "Sin espacios";
                                if (!/^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]+$/i.test(trimmed)) return "Solo letras";
                                return true;
                            },
                        })}
                    />
                    {errors.apellido && (
                        <span id="apellido-error" className={errorClass} role="alert">
                            {errors.apellido.message}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Contacto ── */}
            <FieldSection label="Contacto" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                    <label htmlFor="email" className={labelClass}>Email</label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="off"
                        className={inputBase}
                        placeholder="usuario@ejemplo.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        {...register("email", {
                            required: "Campo incompleto",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Email no válido",
                            },
                        })}
                    />
                    {errors.email && (
                        <span id="email-error" className={errorClass} role="alert">
                            {errors.email.message}
                        </span>
                    )}
                </div>

                {/* Teléfono */}
                <div>
                    <label htmlFor="phone" className={labelClass}>Celular</label>
                    <input
                        id="phone"
                        type="text"
                        autoComplete="off"
                        className={inputBase}
                        placeholder="11 1234-5678"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "phone-error" : undefined}
                        {...register("phone", {
                            required: "Campo incompleto",
                            // Validación comentada preservada igual que en el original:
                            /* validate: (value) => {
                                const cleanValue = value.replace(/[\s\-()]/g, "");
                                if (!/^\d+$/.test(cleanValue)) return "Solo se permiten números";
                                const normalized = cleanValue.startsWith("15") ? cleanValue.slice(2) : cleanValue;
                                if (!/^11\d{8}$/.test(normalized)) return "Número de celular no válido";
                                return true;
                            }, */
                        })}
                    />
                    {errors.phone && (
                        <span id="phone-error" className={errorClass} role="alert">
                            {errors.phone.message}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Ubicación ── */}
            <FieldSection label="Ubicación" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Dirección */}
                <div>
                    <label htmlFor="location" className={labelClass}>Dirección</label>
                    <input
                        id="location"
                        type="text"
                        autoComplete="off"
                        className={inputBase}
                        placeholder="Calle San Martín 567"
                        {...register("location")}
                    />
                </div>

                {/* Ciudad — FormLocalidades usa register() internamente, sin cambios */}
                <div>
                    <FormLocalidades
                        labelClass={labelClass}
                        inputBase={inputBase}
                        errorClass={errorClass}
                        localidades={localidades}
                        register={register}
                        errors={errors}
                        name="city"
                    />
                </div>
            </div>

            {/* ── Datos de acceso ── */}
            <FieldSection label="Datos de acceso" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* CUIT — CUITInput usa register() + setValue() internamente, sin cambios */}
                <div>
                    <CUITInput
                        labelClass={labelClass}
                        inputBase={inputBase}
                        errorClass={errorClass}
                        register={register}
                        setValue={setValue}
                        errors={errors}
                        name="cuit"
                    />
                </div>

                {/* Contraseña */}
                <div>
                    <label htmlFor="password" className={labelClass}>Contraseña</label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="off"
                            className={`${inputBase} pr-11`}
                            placeholder="••••••••"
                            aria-invalid={!!errors.password}
                            aria-describedby={errors.password ? "password-error" : undefined}
                            {...register("password", {
                                required: "La contraseña es obligatoria",
                                validate: {
                                    minLength: v => v.length >= 8 || "Mínimo 8 caracteres",
                                    maxLength: v => v.length <= 15 || "Máximo 15 caracteres",
                                    hasUppercase: v => /[A-Z]/.test(v) || "Al menos una mayúscula",
                                    hasLowercase: v => /[a-z]/.test(v) || "Al menos una minúscula",
                                    hasNumber: v => /\d/.test(v) || "Al menos un número",
                                    noSpaces: v => !/\s/.test(v) || "Sin espacios",
                                },
                            })}
                        />
                        <button
                            type="button"
                            onClick={onTogglePassword}
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                        >
                            {showPassword ? <EyeOpen /> : <EyeClosed />}
                        </button>
                    </div>
                    {errors.password && (
                        <span id="password-error" className={errorClass} role="alert">
                            {errors.password.message}
                        </span>
                    )}
                </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
                <label htmlFor="confirmPassword" className={labelClass}>
                    Confirmar contraseña
                </label>
                <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="off"
                    className={inputBase}
                    placeholder="••••••••"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                    {...register("confirmPassword", {
                        required: "Campo incompleto",
                        validate: (value) =>
                            value === watch("password") || "Las contraseñas no coinciden",
                    })}
                />
                {errors.confirmPassword && (
                    <span id="confirmPassword-error" className={errorClass} role="alert">
                        {errors.confirmPassword.message}
                    </span>
                )}
            </div>

        </div>
    );
}