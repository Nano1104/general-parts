import { useMemo } from 'react';

const useCartTotal = (products) => {
    return useMemo(() => {
        if (!products || !Array.isArray(products)) return 0;
        
        return products.reduce((total, prod) => {
            // Verificación adicional por si algún producto no tiene la estructura esperada
            const price = prod?.product?.precioimpre || 0;
            const quantity = prod?.quantity || 0;
            return total + (price * quantity);
        }, 0);
    }, [products]);
}

export default useCartTotal;