// Cantidad válida para carrito/reserva: entero positivo con un tope de cordura
export const MAX_QUANTITY = 9999;

export const isValidQuantity = (q) => Number.isInteger(q) && q >= 1 && q <= MAX_QUANTITY;
