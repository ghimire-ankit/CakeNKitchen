const express = require('express');
const { getMessages, sendMessage } = require('../controllers/messageController');

const router = express.Router();

router.get('/:orderId', getMessages);
router.post('/:orderId', sendMessage);

module.exports = router;
