const pool = require('../config/db');

class OrderMessage {
    static async create(data) {
        const { order_id, sender_role, sender_name, message } = data;
        try {
            const [result] = await pool.query(
                'INSERT INTO order_messages (order_id, sender_role, sender_name, message) VALUES (?, ?, ?, ?)',
                [order_id, sender_role, sender_name, message]
            );
            return result.insertId;
        } catch (err) {
            console.error('Error creating order message:', err);
            throw err;
        }
    }

    static async getByOrderId(order_id) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM order_messages WHERE order_id = ? ORDER BY created_at ASC',
                [order_id]
            );
            return rows;
        } catch (err) {
            console.error('Error fetching order messages:', err);
            throw err;
        }
    }
}

module.exports = OrderMessage;
