// hooks/useProducts.js
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../utils/api_url.js";
import { useDebounce } from "./useDebounce.js";

// Fix 1: fetchProducts en las deps del useEffect
// Fix 2: eliminar el parámetro isReset de buildParams (nunca se usó)

export function useProducts({ searchValue, category, subcategory, brand, price }) {
    const debouncedSearch = useDebounce(searchValue, 300);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    const pageRef = useRef(1);
    const lastIdRef = useRef(null);
    const isLoadingRef = useRef(false);
    const abortControllerRef = useRef(null);

    // ── Sin isReset (no se usaba) ──────────────────────────────────────────
    const buildParams = useCallback(() => {
        const isSearch = !!debouncedSearch;

        const base = {
            limit: 10,
            ...(debouncedSearch && { search: debouncedSearch }),
            // ✅ Cuando hay búsqueda activa, ignorar categoría/subcategoría
            // El usuario quiere resultados globales, no restringidos a la sección
            ...(!isSearch && category && { category }),
            ...(!isSearch && subcategory && { subcategory }),

            // Precio y marca sí aplican siempre (el usuario los eligió explícitamente)
            ...(brand && { brand }),
            ...(price?.length === 2 && { minPrice: price[0], maxPrice: price[1] }),
        };

        if (isSearch) {
            return { ...base, page: pageRef.current };
        } else {
            return {
                ...base,
                ...(lastIdRef.current && { lastId: lastIdRef.current }),
            };
        }
    }, [debouncedSearch, category, subcategory, brand, price]);

    const fetchProducts = useCallback(async (isReset = false) => {
        if (isLoadingRef.current) return;

        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        isLoadingRef.current = true;
        setLoading(true);
        if (isReset) setError(null);

        try {
            const params = buildParams();   // ← sin pasar isReset

            const { data } = await axios.get(`${API_URL}/api/products`, {
                params,
                withCredentials: true,
                signal: abortControllerRef.current.signal,
            });

            const newProducts = data.products || [];

            setProducts(prev => {
                const updated = isReset ? newProducts : [...prev, ...newProducts];
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
            if (axios.isCancel(err)) return;
            console.error("Error loading products:", err);
            setError(err.response?.data?.message || "Error al cargar productos");
            setHasMore(false);
        } finally {
            isLoadingRef.current = false;
            setLoading(false);
        }
    }, [buildParams, debouncedSearch]);

    // Fix: fetchProducts en las deps ──────────────────────────────────────
    useEffect(() => {
        pageRef.current = 1;
        lastIdRef.current = null;
        fetchProducts(true);
    }, [fetchProducts]);
    // ↑ fetchProducts ya incluye debouncedSearch/category/etc via buildParams,
    //   así que no necesitás listarlos de nuevo acá

    const loadMore = useCallback(() => {
        if (!isLoadingRef.current && hasMore) {
            fetchProducts(false);
        }
    }, [fetchProducts, hasMore]);

    return { products, loading, hasMore, error, loadMore };
}