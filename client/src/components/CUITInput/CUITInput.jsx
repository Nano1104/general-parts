import { useState, useEffect } from 'react';

// Utilidades para validación y formato
const formatCUIT = (value) => {
    const nums = value.replace(/[^\d]/g, '');
    if (nums.length <= 2) return nums;
    if (nums.length <= 10) return `${nums.slice(0, 2)}-${nums.slice(2)}`;
    return `${nums.slice(0, 2)}-${nums.slice(2, 10)}-${nums.slice(10, 11)}`;
};

// Fix correcto:
const validarCUIT = (cuit) => {
    const cuitLimpio = cuit.replace(/[-\s]/g, '');
    if (!/^\d{11}$/.test(cuitLimpio)) return "Debe tener 11 dígitos";

    const tiposValidos = ['20', '23', '24', '27', '30', '33', '34'];
    if (!tiposValidos.includes(cuitLimpio.substring(0, 2))) {
        return "Tipos válidos: 20, 23, 24, 27, 30, 33, 34";
    }

    const digitos = cuitLimpio.split('').map(Number);
    const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    const suma = factores.reduce((acc, f, i) => acc + digitos[i] * f, 0);
    const resto = suma % 11;

    // ← Este caso faltaba completamente
    if (resto === 1) return "CUIT inválido";

    const digitoEsperado = resto === 0 ? 0 : 11 - resto;
    if (digitos[10] !== digitoEsperado) return "Dígito verificador inválido";

    return true;
};

export const CUITInput = ({ register, errors, name = "cuit", labelClass, inputBase, errorClass }) => {

    return (
        <div className="w-full flex flex-col relative">
            <label htmlFor="password" className={labelClass}>CUIT</label>
            <input
                type="text"
                autoComplete="off"
                className={inputBase + " " + (errors?.[name]?.message ? errorClass : "")}
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