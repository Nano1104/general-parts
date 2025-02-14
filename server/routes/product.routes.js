import express from "express";
import { authenticateJWT } from "../utils/jwt.js"
import { getProducts, postProducts, addFieldToProducts, changeProductFieldVal, changeFieldToProducts, changeFieldValueToProducts, deleteFieldFromProducts, updateStock, deleteMongoDBCollection } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts)
router.get('/post-products-in-db', postProducts)
router.put("/add-field-to-products", authenticateJWT, addFieldToProducts)
router.put("/change-product-fieldValue/:prodId", authenticateJWT, changeProductFieldVal)
router.put("/change-field-value-to-products", changeFieldValueToProducts)                 //cambia el valor de un campo de los productos
router.put("/change-field-to-products", changeFieldToProducts)                          //cambia el nombre de un campo de los productos
router.put("/delete-products-field", deleteFieldFromProducts)
router.put("/update-stock/:productId", updateStock)                 //cambia el stock de un producto
router.delete("/delete-mongo-db", deleteMongoDBCollection)


export default router;