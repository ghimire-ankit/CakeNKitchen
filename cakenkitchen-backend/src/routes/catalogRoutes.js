const express = require('express');
const { getCategories, getCakes, getCakeById, getAdminCakes, createCake, toggleCake, createOrder, getAdminOrders, updateOrderStatus } = require('../controllers/catalogController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

const router = express.Router();
router.get('/categories', getCategories);
router.get('/cakes', getCakes);
router.get('/cakes/:id', getCakeById);

// Admin catalogue management
router.get('/cakes/admin', authenticateToken, isAdmin, getAdminCakes);
router.post('/cakes', authenticateToken, isAdmin, createCake);
router.patch('/cakes/:id/toggle', authenticateToken, isAdmin, toggleCake);

// Orders security routes
router.post('/orders', createOrder);
router.get('/orders', authenticateToken, isAdmin, getAdminOrders);
router.patch('/orders/:id/status', authenticateToken, isAdmin, updateOrderStatus);

module.exports = router;
