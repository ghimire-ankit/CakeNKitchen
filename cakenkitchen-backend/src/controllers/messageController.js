const OrderMessage = require('../models/OrderMessage');
const Notification = require('../models/Notification');
const pool = require('../config/db');

const getMessages = async (req, res) => {
    try {
        const { orderId } = req.params;
        const messages = await OrderMessage.getByOrderId(orderId);
        res.json({ success: true, count: messages.length, data: messages });
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve messages' });
    }
};

const sendMessage = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { sender_role, sender_name, message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, error: 'Message cannot be empty' });
        }

        const messageId = await OrderMessage.create({
            order_id: orderId,
            sender_role: sender_role || 'customer',
            sender_name: sender_name || 'Customer',
            message: message.trim()
        });

        // Trigger Notification
        if (sender_role === 'customer') {
            // Alert Admin
            await Notification.create({
                user_id: null,
                title: `New Message on Order #${orderId}`,
                message: `${sender_name || 'Customer'}: "${message.trim()}"`
            });
        } else {
            // Alert Customer
            const [rows] = await pool.query('SELECT user_id FROM orders WHERE order_id = ?', [orderId]);
            if (rows.length > 0 && rows[0].user_id) {
                await Notification.create({
                    user_id: rows[0].user_id,
                    title: `Bakery Reply on Order #${orderId}`,
                    message: `Owner: "${message.trim()}"`
                });
            }
        }

        res.status(201).json({ success: true, messageId });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ success: false, error: 'Failed to send message' });
    }
};

module.exports = { getMessages, sendMessage };
