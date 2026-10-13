import express from "express";
import { validateObjectIdParam } from "../utils/validation.js";
import { authenticateJWT, requireAdmin, resolvePriceAccess } from "../utils/jwt.js"
import {
    getProducts, getProductById, getCategoriesAndSubcategories, getHighlightedProducts, uploadExcelProducts, highlightProduct, unhighlightProduct,
    changeProductFieldVal, downloadExcelProducts
} from "../controllers/product.controller.js";

import multer from "multer"

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB (ajusta según necesites)
})

const router = express.Router();
router.param("prodId", validateObjectIdParam);

// ========================================
// REGLA DE ORO: Rutas estáticas PRIMERO, dinámicas DESPUÉS
// ========================================

// GET ROUTES - Rutas estáticas primero
// Lectura pública del catálogo: auth opcional, los precios solo van a usuarios dados de alta.
router.get("/highlight/products", resolvePriceAccess, getHighlightedProducts)
router.get("/rubro/get-categories-and-subcategories", getCategoriesAndSubcategories)
router.get('/download-excel', authenticateJWT, requireAdmin, downloadExcelProducts)

// GET ROUTES - Rutas dinámicas después
router.get("/", resolvePriceAccess, getProducts)
router.get("/id/:id", resolvePriceAccess, getProductById)

// POST ROUTES - todas administrativas
router.post("/upload-excel", authenticateJWT, requireAdmin, upload.single("excelFile"), uploadExcelProducts)

// PUT ROUTES - Rutas estáticas primero (todas administrativas)
router.put("/highlight/unHighlight-product/:id", authenticateJWT, requireAdmin, unhighlightProduct)

// PUT ROUTES - Rutas dinámicas después (todas administrativas)
router.put("/highlight-product/:id", authenticateJWT, requireAdmin, highlightProduct)
router.put("/change-product-fieldValue/:prodId", authenticateJWT, requireAdmin, changeProductFieldVal)


export default router;