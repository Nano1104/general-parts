// Descuentos por cliente: discount_1..3 son porcentajes que se aplican en cascada sobre el precio de lista.
// Debe coincidir con client/src/utils/discounts.js (el frontend muestra el mismo cálculo).

export const DISCOUNT_FIELDS = ["discount_1", "discount_2", "discount_3"];

export const isValidDiscount = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100;

// Valores fuera de 0..100 (datos viejos) se tratan como 0 para no generar precios negativos
export const userDiscounts = (user = {}) =>
    Object.fromEntries(DISCOUNT_FIELDS.map(f => [f, isValidDiscount(user[f]) ? user[f] : 0]));

export const netFactor = (user) =>
    Object.values(userDiscounts(user)).reduce((factor, d) => factor * (1 - d / 100), 1);

export const roundMoney = (n) => Math.round(n * 100) / 100;
