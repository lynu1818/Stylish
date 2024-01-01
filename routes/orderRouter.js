import express from "express";
const router = express.Router();

import {orderCheckOut} from "../controllers/order/order.js";
import { getTopProductsBySize, getSalesByPriceRange, getSalesByColors, getTotalRevenue, fetchAndStoreData} from "../controllers/order/order.js";


router.post('/checkout', orderCheckOut);
router.get('/data', fetchAndStoreData);
router.get('/total', getTotalRevenue);
router.get('/sales-by-color', getSalesByColors);
router.get('/sales-by-price-range', getSalesByPriceRange);
router.get('/top-products-by-size', getTopProductsBySize);
router.use('/api/1.0/order', router);

export default router;