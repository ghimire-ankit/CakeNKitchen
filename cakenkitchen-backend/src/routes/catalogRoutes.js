const express = require('express');
const { getCategories, getCakes, getCakeById } = require('../controllers/catalogController');

const router = express.Router();
router.get('/categories', getCategories);
router.get('/cakes', getCakes);
router.get('/cakes/:id', getCakeById);

module.exports = router;
