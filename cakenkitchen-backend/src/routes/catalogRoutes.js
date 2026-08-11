const express = require('express');
const { getCategories, getCakes, getCakeById, getAdminCakes, createCake, toggleCake, createOrder, getUserOrders, getAdminOrders, updateOrderStatus } = require('../controllers/catalogController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { validateCake, validateOrder } = require('../middleware/validator');

const router = express.Router();
router.get('/categories', getCategories);
router.get('/cakes', getCakes);
router.get('/cakes/:id', getCakeById);

// Admin catalogue management
router.get('/cakes/admin', authenticateToken, isAdmin, getAdminCakes);
router.post('/cakes', authenticateToken, isAdmin, validateCake, createCake);
router.patch('/cakes/:id/toggle', authenticateToken, isAdmin, toggleCake);

// Orders routes
router.post('/orders', validateOrder, createOrder);
router.get('/orders', authenticateToken, isAdmin, getAdminOrders);
router.get('/orders/user/:userId', authenticateToken, getUserOrders);
router.patch('/orders/:id/status', authenticateToken, updateOrderStatus); // Temporarily removed isAdmin so users can cancel orders. Needs controller-level ownership check.

module.exports = router;
