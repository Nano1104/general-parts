// hooks/useDebounce.js
import { useState, useEffect } from "react";

export function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);  // limpia si value cambia antes del delay
    }, [value, delay]);

    return debouncedValue;
}