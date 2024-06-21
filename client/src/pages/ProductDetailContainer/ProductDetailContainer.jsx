import axios from "axios";
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";

import { ProductDetail } from "../../components/ProductDetail/ProductDetail.jsx";
import { Loading } from "../../components/Loading/Loading.jsx";

export const ProductDetailContainer = () => {
    const { id } = useParams();
    const [prodToRender, setProdToRender] = useState([]);
    const [loading, setLoading] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await axios.get("/api/products", { withCredentials: true });
                const prodFound = res.data.products.find(prod => prod.codpro === id);
                setProdToRender(prodFound);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id])

    return(
        <>
            {
                loading
                ? <Loading />
                : <ProductDetail prod={prodToRender} />
            }
        </>
    )
}