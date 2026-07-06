const express = require('express');
const { getCategories, getCakes, getCakeById, getAdminCakes, createCake, toggleCake, createOrder, getAdminOrders, updateOrderStatus } = require('../controllers/catalogController');

const router = express.Router();
router.get('/categories', getCategories);
router.get('/cakes', getCakes);
router.get('/cakes/admin', getAdminCakes);
router.post('/cakes', createCake);
router.patch('/cakes/:id/toggle', toggleCake);
router.get('/cakes/:id', getCakeById);

router.post('/orders', createOrder);
router.get('/orders', getAdminOrders);
router.patch('/orders/:id/status', updateOrderStatus);

module.exports = router;
