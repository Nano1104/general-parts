// src/routes/search.js
import { Router } from 'express';
import {
    searchProducts,
    indexProduct,
    indexProductsBulk,
    deleteProduct,
} from '../typesense/products.js';

const router = Router();

// GET /api/search?q=zapatillas&category=calzado&minPrice=50&maxPrice=200
router.get('/search', async (req, res) => {
    try {
        const {
            q: query,
            category,
            brand,
            minPrice,
            maxPrice,
            sortBy,
            page,
            perPage,
        } = req.query;

        const results = await searchProducts({
            query,
            category,
            brand,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            sortBy,
            page: page ? parseInt(page) : 1,
            perPage: perPage ? parseInt(perPage) : 20,
        });

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/products — Indexar un producto
router.post('/products', async (req, res) => {
    try {
        const result = await indexProduct(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/products/bulk — Indexar múltiples productos
router.post('/products/bulk', async (req, res) => {
    try {
        const { products } = req.body;
        const results = await indexProductsBulk(products);
        res.json({ success: true, data: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// DELETE /api/products/:id
router.delete('/products/:id', async (req, res) => {
    try {
        await deleteProduct(req.params.id);
        res.json({ success: true, message: 'Producto eliminado del índice' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;