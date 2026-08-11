const express = require('express');
const multer = require('multer');
const path = require('path');
const { getCategories, getCakes, getCakeById, getAdminCakes, createCake, deleteCake, toggleCake, createOrder, getUserOrders, getAdminOrders, updateOrderStatus } = require('../controllers/catalogController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cake_' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const router = express.Router();
router.get('/categories', getCategories);
router.get('/cakes', getCakes);
router.get('/cakes/admin', getAdminCakes);
router.post('/cakes', upload.single('image'), createCake);
router.delete('/cakes/:id', deleteCake);
router.patch('/cakes/:id/toggle', toggleCake);
router.get('/cakes/:id', getCakeById);

router.post('/orders', createOrder);
router.get('/orders', getAdminOrders);
router.get('/orders/user/:userId', getUserOrders);
router.patch('/orders/:id/status', updateOrderStatus);

module.exports = router;
