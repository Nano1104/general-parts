import axios from "axios";
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";

import { ProductDetail } from "../../components/ProductDetail/ProductDetail.jsx";
import { Loading } from "../../components/Loading/Loading.jsx";

import { API_URL } from "../../utils/api_url.js";

export const ProductDetailContainer = () => {
    const { id } = useParams();

    const [prodToRender, setProdToRender] = useState([]);
    const [loading, setLoading] = useState();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API_URL}/api/products/id/${id}`, { withCredentials: true });
                setProdToRender(res.data.product);
                console.log("🚀 ~ fetchData ~ res:", res)
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