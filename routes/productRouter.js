import express from "express";
const router = express.Router();

import {productDetails, productList, productSearch, paginationMiddleware} from "../controllers/product/product.js";
import {uploadProductImage, productCreate} from "../controllers/product/productCreateController.js";
import { adminOnly } from "../middleware/adminOnly.js";

router.get('/details', productDetails);
router.post('/create', uploadProductImage, adminOnly, productCreate);
router.get('/search', paginationMiddleware, productSearch);
router.get('/:category', paginationMiddleware, productList);

router.use('/api/1.0/products', router);

export default router;