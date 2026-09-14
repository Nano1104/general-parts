import { NavBar } from "../../components/NavBar/NavBar.jsx";
import { Logo } from "../../components/Logo/Logo.jsx";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx";

// icons
import { FaWhatsapp } from "react-icons/fa";

/**
 * Home Component — Rediseño premium
 *
 * Cambios de arquitectura respecto al original:
 *  1. Background visible en TODOS los breakpoints (eliminado hidden lg:block).
 *  2. Sistema de overlays en lugar de blur/grayscale CSS sobre la imagen.
 *     — Overlay oscuro base + gradiente direccional = mejor performance + look más moderno.
 *  3. Animaciones de entrada con CSS keyframes (fadeInUp staggered).
 *  4. Tipografía con mayor jerarquía: pre-heading → h1 → tagline secundario.
 *  5. CTA sin layout shift en hover (eliminado hover:font-semibold).
 *  6. Bug fix: segundo número WhatsApp mostraba el mismo que el primero.
 *  7. Accesibilidad: aria-label en links de WhatsApp.
 */
export const Home = () => {
    const { authUser } = useAuthContext();

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-zinc-950">

            {/* ─── Keyframes ───────────────────────────────────────────────
                Definidas aquí para no requerir cambios en tailwind.config.js.
                Para proyectos grandes, mover a tailwind.config.js → theme.extend.keyframes
            ─────────────────────────────────────────────────────────────── */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0);    }
                }
                .anim-fade-up {
                    opacity: 0;
                    animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .delay-100 { animation-delay: 0.10s; }
                .delay-250 { animation-delay: 0.25s; }
                .delay-400 { animation-delay: 0.40s; }
                .delay-550 { animation-delay: 0.55s; }
                .delay-700 { animation-delay: 0.70s; }
            `}</style>

            {/* ─── Background — Sistema de overlays ────────────────────────
                ANTES: blur-[3px] + grayscale-[100%] + brightness-[80%] en fullscreen
                       → fuerza compositing layer GPU costoso
                       → hidden lg:block → mobile sin fondo (experiencia rota)

                AHORA: imagen limpia a plena calidad en todos los breakpoints
                       → overlay oscuro base (zinc-950/75)
                       → gradiente horizontal: oscurece hacia la izquierda donde está el texto
                       → gradiente vertical: oscurece el techo y el suelo para los controles
                       → resultado: legibilidad perfecta sin degradar la imagen
            ─────────────────────────────────────────────────────────────── */}

            {/* Capa 1: imagen de fondo */}
            <div className="absolute inset-0 bg-homeBg bg-cover bg-center" />

            {/* Capa 2: overlay oscuro base */}
            <div className="absolute inset-0 bg-zinc-950/70" />

            {/* Capa 3: gradiente direccional horizontal — oscurece donde está el texto */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/40 to-zinc-950/10" />

            {/* Capa 4: gradiente vertical — oscurece el techo (navbar) y el suelo (footer) */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-transparent to-zinc-950/80" />

            {/* ─────────────────────────────────────────────────────────── */}

            <NavBar />

            <div className="relative z-10 flex flex-col min-h-screen">

                {/* ── Contenido principal ── */}
                <main className="flex-1 flex flex-col justify-center
                                 px-5 sm:px-8 lg:px-14 xl:px-20 2xl:px-28
                                 pt-28 sm:pt-32 lg:pt-0 pb-8">

                    <div className="max-w-xl sm:max-w-2xl lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">

                        {/* Pre-heading — da contexto geográfico y categoría */}
                        <div className="flex items-center gap-3 mb-7 sm:mb-8 anim-fade-up delay-100">
                            <span className="inline-block w-7 h-px bg-lightRed flex-shrink-0" />
                            <span className="font-montserrat text-white/80 text-[12px] tracking-[0.16em] uppercase">
                                Buenos Aires — Argentina
                            </span>
                        </div>

                        {/* Logo del negocio */}
                        <div className="anim-fade-up delay-250">
                            <Logo />
                        </div>

                        {/* H1 — jerarquía tipográfica principal */}
                        <h1 className="font-montserrat font-semibold text-white
                                       text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] 2xl:text-6xl
                                       leading-[1.1] tracking-tight
                                       mt-7 sm:mt-8 lg:mt-10
                                       anim-fade-up delay-400">
                            Venta de repuestos{" "}
                            <br className="hidden sm:block" />
                            <span className="text-white/35">para todas las marcas.</span>
                        </h1>

                        {/* Tagline secundario */}
                        <p className="font-montserrat font-light text-white/45
                                      text-sm sm:text-base lg:text-lg
                                      mt-5 lg:mt-6 leading-relaxed tracking-wide
                                      anim-fade-up delay-550">
                            Encontrá el repuesto que necesitás con asesoramiento y entrega rápida.
                        </p>

                        {/* ── CTA ── */}
                        <div className="mt-10 lg:mt-14 anim-fade-up delay-700">
                            {authUser ? (
                                <Link
                                    to="/productos"
                                    className="group inline-flex items-center gap-5
                                               bg-lightRed text-white rounded-md
                                               font-montserrat font-medium
                                               text-[10px] tracking-[0.28em] uppercase
                                               px-8 py-4 sm:px-10 sm:py-[1.1rem]
                                               transition-all duration-300 ease-out
                                               hover:bg-white hover:text-zinc-900
                                               focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lightRed"
                                >
                                    Ver repuestos
                                    {/* Arrow — translate en hover sin cambiar el peso del texto */}
                                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                                        →
                                    </span>
                                </Link>
                            ) : (
                                <Link
                                    to="/authPage/"
                                    className="group inline-flex items-center gap-5
                                               border border-white/30 text-white rounded-md
                                               font-montserrat font-medium
                                               text-[10px] tracking-[0.20em] uppercase
                                               px-8 py-4 sm:px-10 sm:py-[1.1rem]
                                               transition-all duration-300 ease-out
                                               hover:border-white hover:bg-white hover:text-black 
                                               focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                >
                                    Iniciar sesión
                                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                                        →
                                    </span>
                                </Link>
                            )}
                        </div>

                    </div>
                </main>

                {/* ── Footer de contacto ── */}
                <footer className="relative z-10 px-5 sm:px-8 lg:px-14 xl:px-20 2xl:px-28 py-6 sm:py-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center
                                    justify-between gap-5 sm:gap-0">

                        {/* Contacts — left */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0">

                            {/* Label separador */}
                            <span className="font-montserrat text-white/25 text-[9px] tracking-[0.3em] uppercase
                                             hidden sm:block mr-5">
                                Contacto
                            </span>
                            <div className="w-px h-4 bg-white/15 hidden sm:block mr-5" />

                            {/* Bug fix: segundo número ahora muestra su número real (11 6335-8220) */}
                            <WhatsAppLink
                                href="https://wa.me/5491154529682?text=¡Hola!%20Quisiera%20hacer%20una%20consulta."
                                label="Contactar por WhatsApp al 11 5452-9682"
                                number="11 5452-9682"
                            />

                            <div className="w-px h-4 bg-white/10 hidden sm:block mx-5" />

                            <WhatsAppLink
                                href="https://wa.me/5491163358220?text=¡Hola!%20Quisiera%20hacer%20una%20consulta."
                                label="Contactar por WhatsApp al 11 6335-8220"
                                number="11 6335-8220"
                            />
                        </div>

                        {/* Indicador decorativo — right (solo desktop) */}
                        <div className="hidden lg:flex flex-col items-center gap-1.5 opacity-30">
                            <div className="w-px h-8 bg-white/50 relative overflow-hidden">
                                <div className="absolute inset-0 bg-white animate-[pulse_2s_ease-in-out_infinite]" />
                            </div>
                        </div>

                    </div>
                </footer>

            </div>
        </div>
    );
};


/* ─── Sub-components ──────────────────────────────────────────── */

/**
 * WhatsApp contact link con icono y hover state.
 * aria-label obligatorio para accesibilidad (el texto del número solo no describe la acción).
 */
const WhatsAppLink = ({ href, label, number }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="flex items-center gap-2.5 text-white/45 hover:text-white
                   transition-colors duration-200 group"
    >
        <FaWhatsapp
            size={14}
            className="text-lightRed flex-shrink-0
                       transition-transform duration-200 group-hover:scale-110"
        />
        <span className="font-montserrat font-medium text-xs sm:text-sm tracking-wide">
            {number}
        </span>
    </a>
);          