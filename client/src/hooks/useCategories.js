import axios from "axios";
import { getCategorie } from "../utils/getCategorie.js";

const useCategories = () => {

    const getCategories = async () => {
        try {
            const res = await axios.get("/api/products/", { withCredentials: true })
            const products = res.data.products

            const categories = new Set(
                products
                    .map(prod => getCategorie(prod.subrub))
                    .filter(category => category) // Filtrar valores nulos o vacíos
            );
            return Array.from(categories)
        } catch (err) {
            console.log("Error getting categories")
        }
    }

    return { getCategories }
}

export default useCategories

