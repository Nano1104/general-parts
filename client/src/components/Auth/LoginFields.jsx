// ─── LoginFields ─────────────────────────────────────────────────────────────
//
// CAMBIOS VISUALES vs original:
//   - Labels visibles encima de cada campo (mejora UX + accesibilidad)
//   - inputBase definido una sola vez → una línea para cambiar el estilo global
//   - aria-invalid + aria-describedby en cada input
//   - role="alert" en errores → screen readers lo leen al aparecer
//   - Inputs: bg-zinc-50 sin borde → focus: bg-white + border-zinc-800 (moderno)
//
// LÓGICA: sin cambios. register() y validaciones idénticos al original.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from "react";

// Clases base compartidas — cambiá acá y se aplica a todos los inputs del componente.
const inputBase =
    "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 " +
    "text-zinc-900 text-sm placeholder-zinc-300 " +
    "focus:outline-none focus:bg-white focus:border-zinc-800 " +
    "transition-all duration-150";

const labelClass = "block text-[11px] font-bold text-zinc-400 uppercase tracking-[0.12em] mb-2";
const errorClass = "text-red-500 text-xs font-medium mt-1.5 block";

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

export default function LoginFields({ register, errors }) {
    const [showPassword, setShowPassword] = useState(false);
    
    return (
        <div className="space-y-5">

            {/* Email */}
            <div>
                <label htmlFor="emailLogin" className={labelClass}>
                    Email
                </label>
                <input
                    id="emailLogin"
                    type="email"
                    autoComplete="off"
                    className={inputBase}
                    placeholder="usuario@ejemplo.com"
                    aria-invalid={!!errors.emailLogin}
                    aria-describedby={errors.emailLogin ? "emailLogin-error" : undefined}
                    {...register("emailLogin", {
                        required: "Campo incompleto",
                    })}
                />
                {errors.emailLogin && (
                    <span id="emailLogin-error" className={errorClass} role="alert">
                        {errors.emailLogin.message}
                    </span>
                )}
            </div>

            {/* Contraseña */}
            <div>
                <label htmlFor="passwordLogin" className={labelClass}>
                    Contraseña
                </label>
                <div className="relative">
                    <input
                        id="passwordLogin"
                        type={showPassword ? "text" : "password"}
                        autoComplete="off"
                        className={`${inputBase} pr-11`}
                        placeholder="••••••••"
                        aria-invalid={!!errors.passwordLogin}
                        aria-describedby={errors.passwordLogin ? "passwordLogin-error" : undefined}
                        {...register("passwordLogin", {
                            required: "Campo incompleto",
                        })}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                    >
                        {showPassword ? <EyeOpen /> : <EyeClosed />}
                    </button>
                </div>
                {errors.passwordLogin && (
                    <span id="passwordLogin-error" className={errorClass} role="alert">
                        {errors.passwordLogin.message}
                    </span>
                )}
            </div>

        </div>
    );
}