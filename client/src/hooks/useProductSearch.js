import axios from "axios"
import { useState, useRef, useCallback, useEffect } from "react";

import { API_URL } from "../utils/api_url.js";

export const useProductSearch = (initialParams = {}, initialOptions = {}) => {  // Añade parámetros iniciales
    const productsPerPage = initialOptions.productsPerPage || 10;
      
    const [state, setState] = useState({
        products: [],
        hasMore: true,
        loading: true, // Loading inicial activado
        error: null
    });

    const loadingRef = useRef(false);
    const abortControllerRef = useRef(null);

    const searchProducts = useCallback(async (params, reset = false) => {
        if (loadingRef.current) return;
        
        loadingRef.current = true;
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();
        
        setState(prev => ({
            ...prev,
            loading: true,
            ...(reset && { products: [], hasMore: true })
        }));

        try {
            const response = await axios.get(`${API_URL}/api/products`, {
                params: {
                    limit: productsPerPage, // Usa el valor configurado
                    ...params
                },
                signal: abortControllerRef.current.signal,
                withCredentials: true
            });

            setState(prev => ({
                products: reset 
                    ? response.data.products 
                    : [...prev.products, ...response.data.products],
                hasMore: response.data.hasMore,
                loading: false,
                error: null
            }));
        } catch (err) {
            if (axios.isCancel(err)) return;
            
            setState(prev => ({
                ...prev,
                loading: false,
                error: err.response?.data?.message || err.message
            }));
        } finally {
            loadingRef.current = false;
        }
    }, [productsPerPage]);

     // Carga inicial al montar el hook
     useEffect(() => {
        /* if (initialParams.search) {
            searchProducts(initialParams, true);
        } */
        searchProducts(initialParams, true);
    }, []); // Solo se ejecuta al montar

    return { ...state, searchProducts };
};