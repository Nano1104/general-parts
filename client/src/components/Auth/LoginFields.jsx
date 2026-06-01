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

// Clases base compartidas — cambiá acá y se aplica a todos los inputs del componente.
const inputBase =
    "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 " +
    "text-zinc-900 text-sm placeholder-zinc-300 " +
    "focus:outline-none focus:bg-white focus:border-zinc-800 " +
    "transition-all duration-150";

const labelClass = "block text-[11px] font-bold text-zinc-400 uppercase tracking-[0.12em] mb-2";
const errorClass = "text-red-500 text-xs font-medium mt-1.5 block";

export default function LoginFields({ register, errors }) {
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
                <input
                    id="passwordLogin"
                    type="password"
                    autoComplete="off"
                    className={inputBase}
                    placeholder="••••••••"
                    aria-invalid={!!errors.passwordLogin}
                    aria-describedby={errors.passwordLogin ? "passwordLogin-error" : undefined}
                    {...register("passwordLogin", {
                        required: "Campo incompleto",
                    })}
                />
                {errors.passwordLogin && (
                    <span id="passwordLogin-error" className={errorClass} role="alert">
                        {errors.passwordLogin.message}
                    </span>
                )}
            </div>

        </div>
    );
}