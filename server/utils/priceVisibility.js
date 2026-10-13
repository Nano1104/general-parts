// Los precios solo son visibles para usuarios dados de alta (accepted) o admins.
// Cualquier respuesta que incluya productos para otro usuario debe pasar por acá.

const PRICE_FIELDS = ["precioimpre", "porcen1"];

export const userCanSeePrices = (user) => !!user && (user.accepted === true || user.role === "admin");

export function stripPrices(product) {
    if (!product || product._bsontype === "ObjectId") return product; // ref sin popular
    const obj = product.toObject ? product.toObject() : { ...product };
    for (const field of PRICE_FIELDS) delete obj[field];
    return obj;
}

// Carrito con products[].product populado
export function stripCartPrices(cart) {
    if (!cart || !Array.isArray(cart.products)) return cart;
    const obj = cart.toObject ? cart.toObject() : { ...cart };
    obj.products = obj.products.map(item => ({ ...item, product: stripPrices(item.product) }));
    return obj;
}
