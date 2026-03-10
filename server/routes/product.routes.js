import express from "express";
import { authenticateJWT } from "../utils/jwt.js"
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
router.get("/highlight/products", getHighlightedProducts)
router.get("/rubro/get-categories-and-subcategories", getCategoriesAndSubcategories)
router.get('/download-excel', downloadExcelProducts)  // ANTES de /rubro/:rubro

// GET ROUTES - Rutas dinámicas después
router.get("/", getProducts)
router.get("/id/:id", getProductById)
router.get("/rubro/:rubro", getAllProducts)  // Esta debe ir DESPUÉS de las rutas estáticas

// POST ROUTES
router.post('/post-products-in-db', postProducts)
router.post("/upload-excel", upload.single("excelFile"), uploadExcelProducts)

// PUT ROUTES - Rutas estáticas primero
router.put("/highlight/unHighlight-product/:id", unhighlightProduct)
router.put("/add-field-to-products", authenticateJWT, addFieldToProducts)
router.put("/change-field-value-to-products", changeFieldValueToProducts)
router.put("/change-field-to-products", changeFieldToProducts)
router.put("/delete-products-field", deleteFieldFromProducts)
router.put("/put/add-image-to-tornillos", addImageToTornillos)

// PUT ROUTES - Rutas dinámicas después
router.put("/highlight-product/:id", highlightProduct)
router.put("/change-product-fieldValue/:prodId", authenticateJWT, changeProductFieldVal)
router.put("/update-stock/:productId", updateStock)
router.put("/put/change-imageUrl-prod/:prodId", changeImageurlProd)

// DELETE ROUTES - Rutas estáticas primero
router.delete("/delete/dlt-prods-subrubs", deleteProdsWithSubrub)
router.delete("/delete-mongo-db", deleteMongoDBCollection)

// DELETE ROUTES - Rutas dinámicas después
router.delete("/delete/prods/rubro/:rubro", deleteProdsByRubro)


// Rutas estáticas primero
/* router.put("/put/add-imageUrl-toSubrub", addImageUrlToSubrub)
 */
// Rutas dinámicas después


export default router;