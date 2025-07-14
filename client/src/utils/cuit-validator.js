// utils/validations.js
export const validarCUIT = (cuit) => {
  // Eliminar guiones y espacios
  const cuitLimpio = cuit.replace(/[-\s]/g, '');
  
  // Validar formato básico
  if (!/^\d{11}$/.test(cuitLimpio)) {
    return "El CUIT debe tener 11 dígitos";
  }

  // Extraer dígitos
  const digitos = cuitLimpio.split('').map(Number);
  
  // Código de verificador
  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  
  // Calcular suma ponderada
  let suma = 0;
  for (let i = 0; i < 10; i++) {
    suma += digitos[i] * factores[i];
  }

  // Calcular dígito verificador esperado
  const resto = suma % 11;
  const digitoEsperado = resto === 0 ? 0 : 11 - resto;

  // Comparar con el último dígito
  if (digitos[10] !== digitoEsperado) {
    return "CUIT inválido: dígito verificador incorrecto";
  }

  return true; // Válido
};