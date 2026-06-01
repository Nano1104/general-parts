import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext.jsx";

// icons
import { UserIcon } from "../UserIcon/UserIcon.jsx";
import { HiBars3 } from "react-icons/hi2";
import { RxCross1 } from "react-icons/rx";

export const NavBar = () => {
    const { authUser } = useAuthContext();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const isAdmin = authUser?.role === "admin";

    return (
        <>
            {/* ─── Main nav bar ─── */}
            <nav
                className={`
                    fixed top-0 left-0 right-0 z-50
                    transition-all duration-500 ease-in-out
                    ${scrolled
                        ? "bg-zinc-950/90 backdrop-blur-xl border-b border-white/[0.07] py-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                        : "bg-transparent py-5 sm:py-6"
                    }
                `}
            >
                <div className="max-w-screen-2xl mx-auto px-5 sm:px-8 lg:px-14 flex items-center justify-end">
                    {/* ── Desktop nav — right side ── */}
                    <div className="hidden md:flex items-center font-montserrat">
                        {isAdmin && (
                            <>
                                <NavLink to="/admin">Administrador</NavLink>
                                <NavLink to="/reservas">Reservas</NavLink>
                            </>
                        )}

                        {authUser && (
                            <div
                                className={`
                                    flex items-center
                                    ${isAdmin ? "ml-4 pl-4 border-l border-white/20" : ""}
                                `}
                            >
                                <UserIcon />
                            </div>
                        )}
                    </div>

                    {/* ── Mobile controls ── */}
                    <div className="flex md:hidden items-center gap-3">
                        {authUser && <UserIcon />}

                        {/* Burger only appears when there are links to show */}
                        {isAdmin && (
                            <button
                                onClick={() => setMobileOpen((prev) => !prev)}
                                className="text-white/60 hover:text-white transition-colors duration-200 p-1 -mr-1"
                                aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
                                aria-expanded={mobileOpen}
                            >
                                {mobileOpen
                                    ? <RxCross1 size={18} />
                                    : <HiBars3 size={22} />
                                }
                            </button>
                        )}
                    </div>

                </div>
            </nav>

            {/* ─── Mobile dropdown panel ─── */}
            {/*
                Rendered outside the <nav> so it can overlay content independently.
                Transition: fade + slight slide-down.
            */}
            <div
                className={`
                    fixed left-0 right-0 z-40 md:hidden
                    transition-all duration-300 ease-in-out
                    ${mobileOpen
                        ? "opacity-100 pointer-events-auto translate-y-0"
                        : "opacity-0 pointer-events-none -translate-y-1"
                    }
                `}
                style={{ top: scrolled ? "52px" : "68px" }}
                aria-hidden={!mobileOpen}
            >
                <div className="bg-zinc-950/96 backdrop-blur-xl border-b border-white/[0.07] shadow-2xl">
                    <div className="px-5 py-4 flex flex-col font-montserrat">
                        {isAdmin && (
                            <>
                                <MobileNavLink
                                    to="/admin"
                                    onClick={() => setMobileOpen(false)}
                                    showDivider
                                >
                                    Administrador
                                </MobileNavLink>
                                <MobileNavLink
                                    to="/reservas"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Reservas
                                </MobileNavLink>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};


/* ─── Sub-components ──────────────────────────────────────────── */

/**
 * Desktop nav link with animated underline on hover.
 * The underline scales from left to right on hover.
 */
const NavLink = ({ to, children }) => (
    <Link
        to={to}
        className="relative px-5 py-2 text-white/80 hover:text-white
                   text-[12px] tracking-[0.22em] uppercase font-medium
                   transition-colors duration-300 group"
    >
        {children}
        <span
            className="absolute bottom-1 left-5 right-5 h-px bg-lightRed
                       scale-x-0 group-hover:scale-x-100
                       transition-transform duration-300 origin-left"
        />
    </Link>
);

/**
 * Mobile nav link — full-width tap target with optional top divider.
 */
const MobileNavLink = ({ to, onClick, children, showDivider }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`
            py-4 px-1 text-white/55 hover:text-white
            text-[10px] tracking-[0.28em] uppercase font-medium
            transition-colors duration-200
            ${showDivider ? "border-b border-white/[0.07]" : ""}
        `}
    >
        {children}
    </Link>
);