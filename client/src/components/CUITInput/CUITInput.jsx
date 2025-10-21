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


    return (
        <div className="w-full flex flex-col items-center relative">
            <input
                type="text"
                autoComplete="off"
                className="w-full p-3 sm:p-4 bg-transparent outline-none text-cBlack
                            border border-cBlack rounded-xl transition-all duration-200
                            focus:border-lightRed focus:border-2 focus:shadow-md
                            placeholder:text-gray-500"
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
                <span className="text-lightRed font-custom font-medium text-xs mt-2 lg:ml-12">
                    {errors[name].message}
                </span>
            )}
        </div>
    );
};

