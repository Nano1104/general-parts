import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { RxCross1 } from "react-icons/rx";

// Visor de imagen a pantalla completa. Se cierra con Escape, con el botón o haciendo clic fuera
// de la imagen. Bloquea el scroll de la página mientras está abierto y devuelve el foco al
// elemento que lo abrió (accesibilidad con teclado).
export const ImageLightbox = ({ src, alt, onClose }) => {
    const closeRef = useRef(null);

    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;

        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden";
        closeRef.current?.focus();

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus?.();
        };
    }, [onClose]);

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10 cursor-zoom-out"
        >
            <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Cerrar imagen"
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/25 transition-colors
                           focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
                <RxCross1 size={20} />
            </button>
            <img
                src={src}
                alt={alt}
                onClick={(e) => e.stopPropagation()}
                className="max-w-full max-h-full object-contain bg-white rounded-md shadow-2xl cursor-default"
            />
        </div>,
        document.body
    );
};
