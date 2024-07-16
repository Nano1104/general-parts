import fs from 'fs/promises'; // Utilizando la versión de promesas de fs

export const postProductsInDB = async (path) => {
    try {
        const products = JSON.parse(await fs.readFile(path, "utf-8"))
        console.log(products.length)
        const covertedProducts = products.map(prod => ({
            ...prod,
            rubro: Number(prod.rubro),
            subrub: Number(prod.subrub),
            proveed: Number(prod.proveed),
            porcen1: Number(prod.porcen1),
            precioimpre: Number(prod.precioimpre)
        }))
        
        return covertedProducts
    } catch (err) {
        console.log("Error posting products in db")
    }
}