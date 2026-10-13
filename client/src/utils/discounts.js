// Descuentos por cliente: discount_1..3 son porcentajes que se aplican en cascada sobre el precio de lista.
// Debe coincidir con server/utils/discounts.js (el total de la reserva se calcula en el servidor).

const DISCOUNT_FIELDS = ["discount_1", "discount_2", "discount_3"];

const isValidDiscount = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100;

export const userDiscounts = (user) =>
    DISCOUNT_FIELDS.map(f => (isValidDiscount(user?.[f]) ? user[f] : 0));

export const netFactor = (user) =>
    userDiscounts(user).reduce((factor, d) => factor * (1 - d / 100), 1);
