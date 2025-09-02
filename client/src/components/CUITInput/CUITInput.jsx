import { useState, useEffect } from 'react';

// Utilidades para validación y formato
const formatCUIT = (value) => {
    const nums = value.replace(/[^\d]/g, '');
    if (nums.length <= 2) return nums;
    if (nums.length <= 10) return `${nums.slice(0, 2)}-${nums.slice(2)}`;
    return `${nums.slice(0, 2)}-${nums.slice(2, 10)}-${nums.slice(10, 11)}`;
};

const validarCUIT = (cuit) => {
    const cuitLimpio = cuit.replace(/[-\s]/g, '');

    // Validar longitud
    if (!/^\d{11}$/.test(cuitLimpio)) return "Debe tener 11 dígitos";

    // Validar tipo (20, 23, 24, 27, 30, 33, 34)
    const tiposValidos = ['20', '23', '24', '27', '30', '33', '34'];
    if (!tiposValidos.includes(cuitLimpio.substring(0, 2))) {
        return "Tipos válidos: 20, 23, 24, 27, 30, 33, 34";
    }

    // Validar dígito verificador
    const digitos = cuitLimpio.split('').map(Number);
    const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;

    for (let i = 0; i < 10; i++) {
        suma += digitos[i] * factores[i];
    }

    const digitoEsperado = [0, 11].includes(suma % 11) ? 0 : 11 - (suma % 11);
    if (digitos[10] !== digitoEsperado) {
        return "Dígito verificador inválido";
    }

    return true; // CUIT válido
};

export const CUITInput = ({ register, errors, name = "cuit" }) => {
    const [inputValue, setInputValue] = useState('');

    // Validación en tiempo real
    /* useEffect(() => {
        if (inputValue.length >= 11) {
            setIsValid(validarCUIT(inputValue) === true);
        } else {
            setIsValid(null);
        }
    }, [inputValue]); */

    /* const handleChange = (e) => {
        const formatted = formatCUIT(e.target.value);
        setInputValue(formatted);
        e.target.value = formatted; // Para react-hook-form
    }; */

    return (
        <div className="w-full flex flex-col items-center relative">
            <input
                type="text"
                autoComplete="off"
                /* onChange={handleChange} */
                className="p-2 bg-transparent w-full outline-0 text-cBlack
                        border-[1px] border-cBlack rounded-xl
                        focus:border-dotted"
                placeholder="Ingrese su CUIT"
                {...register(name, {
                    required: "El CUIT es obligatorio",
                    validate: (value) => {
                        const result = validarCUIT(value);
                        return result === true || result;
                    }
                })}
            />

            {/* Mensajes de estado */}
            {errors?.[name]?.message && (
                <span className="text-red font-custom font-medium text-xs mt-2 lg:ml-12">
                    {errors[name].message}
                </span>
            )}
        </div>
    );
};

