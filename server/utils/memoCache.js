// Caché en memoria del proceso, con vencimiento e invalidación explícita.
// Alcanza porque el backend corre en una sola instancia (Render) y los datos cacheados
// son chicos; Mongo está lejos (Atlas São Paulo vs Render Oregon, ~200 ms por consulta).

// Un solo valor que se recalcula con `load` cuando vence o se invalida.
// Requests simultáneos mientras se recalcula comparten la misma promesa.
export function createValueCache(ttlMs, load) {
    let value, expiresAt = 0, pending = null;
    return {
        async get() {
            if (Date.now() < expiresAt) return value;
            if (!pending) {
                pending = load()
                    .then(v => { value = v; expiresAt = Date.now() + ttlMs; return v; })
                    .finally(() => { pending = null; });
            }
            return pending;
        },
        invalidate() { expiresAt = 0; },
    };
}

// Valores por clave (ej. por usuario), con tope de tamaño para no crecer sin límite.
export function createKeyedCache(ttlMs, maxEntries = 1000) {
    const map = new Map();
    return {
        get(key) {
            const hit = map.get(key);
            if (!hit) return undefined;
            if (Date.now() > hit.expiresAt) { map.delete(key); return undefined; }
            return hit.value;
        },
        set(key, value) {
            if (map.size >= maxEntries) map.delete(map.keys().next().value); // la más vieja
            map.set(key, { value, expiresAt: Date.now() + ttlMs });
        },
        delete(key) { map.delete(String(key)); },
        clear() { map.clear(); },
    };
}
