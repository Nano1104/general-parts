import express from "express";
import { authenticateJWT, requireAdmin } from "../utils/jwt.js"
import {
    getProducts, getProductById, getAllProducts, getCategoriesAndSubcategories, getHighlightedProducts, postProducts, uploadExcelProducts, highlightProduct, unhighlightProduct, addFieldToProducts,
    changeProductFieldVal, changeFieldToProducts, changeFieldValueToProducts, deleteFieldFromProducts, updateStock, deleteProdsWithSubrub, deleteMongoDBCollection, addImageToTornillos, changeImageurlProd,
    addImageUrlToSubrub, deleteProdsByRubro, downloadExcelProducts
} from "../controllers/product.controller.js";

import multer from "multer"

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB (ajusta según necesites)
})

const router = express.Router();

// ========================================
// REGLA DE ORO: Rutas estáticas PRIMERO, dinámicas DESPUÉS
// ========================================

// GET ROUTES - Rutas estáticas primero
// Lectura pública del catálogo: sin auth.
router.get("/highlight/products", getHighlightedProducts)
router.get("/rubro/get-categories-and-subcategories", getCategoriesAndSubcategories)
router.get('/download-excel', authenticateJWT, requireAdmin, downloadExcelProducts)  // ANTES de /rubro/:rubro

// GET ROUTES - Rutas dinámicas después
router.get("/", getProducts)
router.get("/id/:id", getProductById)
router.get("/rubro/:rubro", authenticateJWT, requireAdmin, getAllProducts)  // Esta debe ir DESPUÉS de las rutas estáticas

// POST ROUTES - todas administrativas
router.post('/post-products-in-db', authenticateJWT, requireAdmin, postProducts)
router.post("/upload-excel", authenticateJWT, requireAdmin, upload.single("excelFile"), uploadExcelProducts)

// PUT ROUTES - Rutas estáticas primero (todas administrativas)
router.put("/highlight/unHighlight-product/:id", authenticateJWT, requireAdmin, unhighlightProduct)
router.put("/add-field-to-products", authenticateJWT, requireAdmin, addFieldToProducts)
router.put("/change-field-value-to-products", authenticateJWT, requireAdmin, changeFieldValueToProducts)
router.put("/change-field-to-products", authenticateJWT, requireAdmin, changeFieldToProducts)
router.put("/delete-products-field", authenticateJWT, requireAdmin, deleteFieldFromProducts)
router.put("/put/add-image-to-tornillos", authenticateJWT, requireAdmin, addImageToTornillos)

// PUT ROUTES - Rutas dinámicas después (todas administrativas)
router.put("/highlight-product/:id", authenticateJWT, requireAdmin, highlightProduct)
router.put("/change-product-fieldValue/:prodId", authenticateJWT, requireAdmin, changeProductFieldVal)
router.put("/update-stock/:productId", authenticateJWT, requireAdmin, updateStock)
router.put("/put/change-imageUrl-prod/:prodId", authenticateJWT, requireAdmin, changeImageurlProd)

// DELETE ROUTES - Rutas estáticas primero (todas administrativas)
router.delete("/delete/dlt-prods-subrubs", authenticateJWT, requireAdmin, deleteProdsWithSubrub)
router.delete("/delete-mongo-db", authenticateJWT, requireAdmin, deleteMongoDBCollection)

// DELETE ROUTES - Rutas dinámicas después (todas administrativas)
router.delete("/delete/prods/rubro/:rubro", authenticateJWT, requireAdmin, deleteProdsByRubro)


// Rutas estáticas primero
/* router.put("/put/add-imageUrl-toSubrub", addImageUrlToSubrub)
 */
// Rutas dinámicas después


export default router;