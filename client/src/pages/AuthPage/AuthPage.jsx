import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth.js";
import { FaArrowRight } from "react-icons/fa6";
import localidades from "../../utils/localidades.json";

// Componentes
import LoginFields from "../../components/Auth/LoginFields.jsx";
import RegisterFields from "../../components/Auth/RegisterFields.jsx";

// ─── LoadingSpinner ───────────────────────────────────────────────────────────
// Moverlo a su propio archivo es lo ideal; acá se mantiene inline sin cambiar nada.
const LoadingSpinner = () => (
    <div className="flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span className="text-sm font-semibold tracking-wide">Procesando...</span>
    </div>
);

// ─── Brand mark ──────────────────────────────────────────────────────────────
// Cuadrado rojo con icono de auto/engranaje — reemplazá el SVG path con tu logo real.
const BrandMark = ({ className = "w-8 h-8" }) => (
    <div className={`${className} bg-red-600 flex items-center justify-center flex-shrink-0`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-[58%] h-[58%]" aria-hidden="true">
            <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
        </svg>
    </div>
);

// ─── Gauge SVG decorativo (panel izquierdo) ───────────────────────────────────
const GaugeSVG = () => {
    const cx = 120, cy = 120;
    const ticks = Array.from({ length: 24 }, (_, i) => {
        const angle = ((i * 15 - 90) * Math.PI) / 180;
        const isMajor = i % 6 === 0;
        const r1 = isMajor ? 89 : 94;
        const r2 = 105;
        return { i, angle, isMajor, r1, r2 };
    });
    // Needle a ~70% del recorrido (200°)
    const needleAngle = ((-90 + 200) * Math.PI) / 180;

    return (
        <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg"
            className="w-52 h-52 opacity-25" aria-hidden="true">
            <circle cx={cx} cy={cy} r="108" stroke="white" strokeWidth="1" />
            <circle cx={cx} cy={cy} r="86" stroke="white" strokeWidth=".5" strokeDasharray="5 5" />
            <circle cx={cx} cy={cy} r="60" stroke="#ef4444" strokeWidth="1" />
            {ticks.map(({ i, angle, isMajor, r1, r2 }) => (
                <line key={i}
                    x1={cx + r1 * Math.cos(angle)} y1={cy + r1 * Math.sin(angle)}
                    x2={cx + r2 * Math.cos(angle)} y2={cy + r2 * Math.sin(angle)}
                    stroke="white" strokeWidth={isMajor ? "2" : "1"}
                />
            ))}
            <line
                x1={cx} y1={cy}
                x2={cx + 68 * Math.cos(needleAngle)}
                y2={cy + 68 * Math.sin(needleAngle)}
                stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r="7" fill="#ef4444" />
            <circle cx={cx} cy={cy} r="3" fill="#0a0a0a" />
        </svg>
    );
};

// ─── Constantes ───────────────────────────────────────────────────────────────
// Fuera del componente — no se recrean en cada render (sin cambios respecto al original)
const localidadesOrdenadas = [...localidades].sort((a, b) =>
    a.nombre.localeCompare(b.nombre)
);

const ERROR_MESSAGES = {
    "User does not exist": "No existe usuario con este email",
    "password incorrect": "Contraseña incorrecta",
    "user already exists": "Este email ya está registrado",
};

// ─── AuthPage ─────────────────────────────────────────────────────────────────
export const AuthPage = () => {
    const { login, register: registerUser, loading, error } = useAuth();
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset,
    } = useForm();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const toggleMode = () => {
        reset();
        setIsLoginMode(prev => !prev);
    };

    const onSubmit = handleSubmit(async (data) => {
        if (isLoginMode) {
            await login({ email: data.emailLogin, password: data.passwordLogin });
        } else {
            await registerUser(data);
        }
    });

    const errorMessage = error ? (ERROR_MESSAGES[error] ?? error) : null;

    return (
        <div className="min-h-screen flex bg-white">

            {/* ── PANEL IZQUIERDO: identidad de marca ──────────────────────────
                Reemplaza el fondo con blur + brightness + grayscale.
                Cero GPU filters. Solo bg-color + grid CSS puro.
            ─────────────────────────────────────────────────────────────────── */}
            <aside className="hidden font-montserrat lg:flex lg:w-[42%] xl:w-[44%] 2xl:w-[40%] bg-zinc-950 flex-col justify-between py-14 px-12 xl:px-16 relative overflow-hidden flex-shrink-0">

                {/* Grid texture — puro CSS, sin filtros */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px)," +
                            "linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />

                {/* Línea roja de acento (izquierda) */}
                <div aria-hidden="true" className="absolute left-0 inset-y-0 w-[3px] bg-red-600" />

                {/* Logo + nombre */}
                <div className="relative z-10 flex items-center gap-3">
                    <BrandMark className="w-9 h-9" />
                    <span className="text-white text-[11px] font-bold tracking-[0.28em] uppercase">
                        AutoRepuestos
                    </span>
                </div>

                {/* SVG decorativo */}
                <div className="relative z-10 flex justify-center">
                    <GaugeSVG />
                </div>

                {/* Tagline */}
                <div className="relative z-10">
                    <p className="text-zinc-500 text-[10px] tracking-[0.28em] uppercase mb-4">
                        Calidad · Precisión · Confianza
                    </p>
                    <h2 className="text-white text-4xl xl:text-5xl font-black leading-none uppercase tracking-tight">
                        Repuestos<br />
                        <span className="text-red-600">al alcance.</span>
                    </h2>
                </div>
            </aside>

            {/* ── PANEL DERECHO: formulario ───────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">

                {/* Topbar mobile */}
                <div className="lg:hidden flex items-center gap-3 px-5 py-4 border-b border-zinc-100 font-montserrat">
                    <BrandMark className="w-7 h-7" />
                    <span className="text-zinc-900 text-[11px] font-bold tracking-[0.22em] uppercase">
                        AutoRepuestos
                    </span>
                </div>

                {/* Área del formulario */}
                <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14 xl:px-20 2xl:px-28">
                    <div className="w-full max-w-lg xl:max-w-xl">

                        {/* Header */}
                        <div className="mb-9">
                            <div className="w-8 h-[3px] bg-red-600 mb-5" aria-hidden="true" />
                            <h1 className="text-zinc-900 text-3xl sm:text-4xl font-montserrat font-black uppercase tracking-tight leading-none mb-2">
                                {isLoginMode ? "Bienvenido" : "Crear cuenta"}
                            </h1>
                            <p className="text-zinc-400 text-sm">
                                {isLoginMode
                                    ? "Ingresá tus credenciales para continuar."
                                    : "Completá el formulario para registrarte."}
                            </p>
                        </div>

                        {/* Form — key fuerza remount al cambiar de modo (sin cambios) */}
                        <form
                            key={isLoginMode ? "login" : "register"}
                            onSubmit={onSubmit}
                            className="space-y-6 font-roboto"
                            noValidate
                        >
                            {isLoginMode ? (
                                <LoginFields register={register} errors={errors} />
                            ) : (
                                <RegisterFields
                                    register={register}
                                    errors={errors}
                                    watch={watch}
                                    setValue={setValue}
                                    showPassword={showPassword}
                                    onTogglePassword={() => setShowPassword(p => !p)}
                                    localidades={localidadesOrdenadas}
                                />
                            )}

                            {/* Error de servidor */}
                            {errorMessage && (
                                <div
                                    role="alert"
                                    className="flex items-center gap-2.5 px-4 py-3 bg-red-50 border-l-2 border-red-500"
                                >
                                    <svg
                                        className="w-4 h-4 text-red-500 flex-shrink-0"
                                        aria-hidden="true"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-zinc-900 hover:bg-red-600
                                           py-[14px] px-6
                                           text-white text-sm font-bold uppercase tracking-[0.12em]
                                           transition-colors duration-200
                                           disabled:bg-zinc-300 disabled:cursor-not-allowed
                                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                            >
                                {loading
                                    ? <LoadingSpinner />
                                    : (isLoginMode ? "Iniciar sesión" : "Crear cuenta")}
                            </button>

                            {/* Toggle login ↔ registro */}
                            <div className="flex items-center justify-between pt-5 border-t border-zinc-100">
                                <span className="text-zinc-400 text-xs uppercase tracking-[0.1em]">
                                    {isLoginMode ? "¿No tenés cuenta?" : "¿Ya tenés cuenta?"}
                                </span>
                                <button
                                    type="button"
                                    onClick={toggleMode}
                                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em]
                                               text-zinc-800 hover:text-red-600 transition-colors group"
                                >
                                    {isLoginMode ? "Registrarse" : "Iniciar sesión"}
                                    <FaArrowRight className="group-hover:translate-x-0.5 transition-transform duration-150" />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};