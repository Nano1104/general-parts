// hooks/useProducts.js
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../utils/api_url.js";
import { useDebounce } from "./useDebounce.js";

export function useProducts({ searchValue, category, subcategory, brand, price }) {
    const debouncedSearch = useDebounce(searchValue, 300);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    // Usamos refs para el estado de paginación — no necesitan re-render
    const pageRef = useRef(1);
    const lastIdRef = useRef(null);
    const isLoadingRef = useRef(false);  // ref en lugar de state para el guard
    const abortControllerRef = useRef(null);

    // ── Construir params ───────────────────────────────────────────────────
    const buildParams = useCallback((isReset) => {
        const isSearch = !!debouncedSearch;

        const base = {
            limit: 10,
            ...(debouncedSearch && { search: debouncedSearch }),
            // Los filtros aplican SIEMPRE, con o sin búsqueda
            ...(category    && { category }),
            ...(subcategory && { subcategory }),
            ...(brand       && { brand }),
            ...(price?.length === 2 && { minPrice: price[0], maxPrice: price[1] }),
        };

        if (isSearch) {
            return { ...base, page: pageRef.current };
        } else {
            return {
                ...base,
                ...(!isReset && lastIdRef.current && { lastId: lastIdRef.current }),
            };
        }
    }, [debouncedSearch, category, subcategory, brand, price]);

    // ── Fetch central ──────────────────────────────────────────────────────
    const fetchProducts = useCallback(async (isReset = false) => {
        if (isLoadingRef.current) return;

        // Cancelar request anterior si existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        isLoadingRef.current = true;
        setLoading(true);
        if (isReset) setError(null);

        try {
            const params = buildParams(isReset);

            const { data } = await axios.get(`${API_URL}/api/products`, {
                params,
                withCredentials: true,
                signal: abortControllerRef.current.signal,  // cancelación
            });

            const newProducts = data.products || [];

            setProducts(prev => {
                const updated = isReset ? newProducts : [...prev, ...newProducts];

                // Guardar cursor para la próxima página
                if (updated.length > 0) {
                    lastIdRef.current = updated[updated.length - 1]._id;
                }

                return updated;
            });

            setHasMore(data.hasMore || false);

            if (debouncedSearch && !isReset) {
                pageRef.current += 1;
            }

        } catch (err) {
            if (axios.isCancel(err)) return;  // request cancelado, no es error
            console.error("Error loading products:", err);
            setError(err.response?.data?.message || "Error al cargar productos");
            setHasMore(false);
        } finally {
            isLoadingRef.current = false;
            setLoading(false);
        }
    }, [buildParams, debouncedSearch]);

    // ── Reset cuando cambian los filtros o la búsqueda ─────────────────────
    useEffect(() => {
        pageRef.current = 1;
        lastIdRef.current = null;
        fetchProducts(true);
    }, [debouncedSearch, category, subcategory, brand, price]);
    //   ↑ debouncedSearch, no searchValue — ya tiene el delay incorporado

    // ── Cargar más (infinite scroll) ───────────────────────────────────────
    const loadMore = useCallback(() => {
        if (!isLoadingRef.current && hasMore) {
            fetchProducts(false);
        }
    }, [fetchProducts, hasMore]);

    return { products, loading, hasMore, error, loadMore };
}