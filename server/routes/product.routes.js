import express from "express";
import { authenticateJWT } from "../utils/jwt.js"
import {
    getProducts, getProductById, getAllProducts, getCategoriesAndSubcategories, getHighlightedProducts, postProducts, uploadExcelProducts, highlightProduct, unhighlightProduct, addFieldToProducts,
    changeProductFieldVal, changeFieldToProducts, changeFieldValueToProducts, deleteFieldFromProducts, updateStock, deleteProdsWithSubrub, deleteMongoDBCollection, addImageToTornillos, changeImageurlProd,
    addImageUrlToSubrub, deleteProdsByRubro
} from "../controllers/product.controller.js";

import multer from "multer"

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB (ajusta según necesites)
})

const router = express.Router();

router.get("/", getProducts)
router.get("/id/:id", getProductById)
router.get("/rubro/get-categories-and-subcategories", getCategoriesAndSubcategories)
router.get("/rubro/:rubro", getAllProducts)                       //devuelve la cantidad de los productos con cierto rubro mandado por parametro
router.get("/highlight/products", getHighlightedProducts)
router.post('/post-products-in-db', postProducts)
router.post("/upload-excel", upload.single("excelFile"), uploadExcelProducts)
router.put("/highlight-product/:id", highlightProduct)
router.put("/highlight/unHighlight-product/:id", unhighlightProduct)
router.put("/add-field-to-products", authenticateJWT, addFieldToProducts)
router.put("/change-product-fieldValue/:prodId", authenticateJWT, changeProductFieldVal)
router.put("/change-field-value-to-products", changeFieldValueToProducts)                 //cambia el valor de un campo de los productos
router.put("/change-field-to-products", changeFieldToProducts)                          //cambia el valor de un campo
router.put("/delete-products-field", deleteFieldFromProducts)
router.put("/update-stock/:productId", updateStock)                 //cambia el stock de un producto
router.delete("/delete/dlt-prods-subrubs", deleteProdsWithSubrub)                          //elimina los productos con el subrubro especificado en el body
router.delete("/delete-mongo-db", deleteMongoDBCollection)
router.delete("/delete/prods/rubro/:rubro", deleteProdsByRubro)


// Rutas estáticas primero
router.put("/put/add-image-to-tornillos", addImageToTornillos)
/* router.put("/put/add-imageUrl-toSubrub", addImageUrlToSubrub) */

// Rutas dinámicas después
router.put("/put/change-imageUrl-prod/:prodId", changeImageurlProd)


export default router;