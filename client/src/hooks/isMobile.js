import { useState, useEffect } from 'react';

export const useIsMobile = (breakpoint = 720) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        handleResize(); // Ejecutar al cargar el componente
        window.addEventListener("resize", handleResize); // Escuchar cambios de tamaño

        return () => window.removeEventListener("resize", handleResize); // Limpiar evento
    }, [breakpoint]); // Dependencia: breakpoint

    return isMobile; // Devuelve el estado de isMobile
};