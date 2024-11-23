
export const isMobileFunction = (breakpoint, isMobile, setIsMobile) => {
    const handleResize = () => {
        setIsMobile(window.innerWidth < breakpoint);
    };

    handleResize(); // Ejecutar al cargar el componente
    window.addEventListener("resize", handleResize); // Escuchar cambios de tamaño

    return () => {
        window.removeEventListener("resize", handleResize); // Limpiar evento
    };
}