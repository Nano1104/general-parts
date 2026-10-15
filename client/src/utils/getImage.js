const imgHover = "https://res.cloudinary.com/dq7dwhqhh/image/upload/f_auto,q_auto/v1754438575/swparts-icon_rkw0nq.png"

export const getImage = (imageUrl) => {
    if (imageUrl) {
        return imageUrl
    } else {
        return imgHover
    }
}

// Agrega un ancho máximo a una URL de Cloudinary, después de las transformaciones que ya tenga
// (ej. .../upload/f_auto,q_auto/v123/x.png -> .../upload/f_auto,q_auto/w_240,c_limit/v123/x.png).
// Sin esto se descarga la foto original para mostrarla en un cuadrado de 72 px.
const withCloudinaryWidth = (url, width) =>
    url.replace(/(\/image\/upload\/(?:[^/]+\/)*?)(v\d+\/)/, `$1w_${width},c_limit/$2`);

const isCloudinary = (url) => url.includes("res.cloudinary.com") && /\/v\d+\//.test(url);

// Miniatura para el catálogo y el carrito. Las imágenes locales de /products/ tienen su versión
// "-thumb" generada aparte (ver server/utils/productImages.js).
export const thumbnailUrl = (imageUrl) => {
    if (!imageUrl) return getImage(imageUrl);
    if (imageUrl.startsWith("/products/")) return imageUrl.replace(/\.jpg$/, "-thumb.jpg");
    if (isCloudinary(imageUrl)) return withCloudinaryWidth(imageUrl, 240);
    return imageUrl;
};

// Versión grande, para el detalle y el visor de imagen
export const fullImageUrl = (imageUrl) => {
    if (!imageUrl) return getImage(imageUrl);
    if (isCloudinary(imageUrl)) return withCloudinaryWidth(imageUrl, 1200);
    return imageUrl;
};
