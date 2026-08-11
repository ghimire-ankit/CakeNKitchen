const pool = require('../config/db');

class Order {
    static async create(orderData) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const {
                customer_name, email, phone, address, delivery_date,
                delivery_time, notes, payment_method, delivery_type, total, items,
                latitude, longitude
            } = orderData;

            let [userRows] = await conn.query('SELECT user_id FROM users WHERE email = ?', [email]);
            let user_id = null;
            if (userRows.length > 0) {
                user_id = userRows[0].user_id;
            } else {
                const [userRes] = await conn.query(
                    'INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)',
                    [customer_name, email, phone, 'guest_checkout', 'customer']
                );
                user_id = userRes.insertId;
            }

            const [orderRes] = await conn.query(
                'INSERT INTO orders (user_id, status, total, delivery_date, delivery_address, delivery_time, delivery_type, payment_method, latitude, longitude, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [user_id, 'Pending', total, delivery_date, address, delivery_time, delivery_type || 'standard', payment_method || 'cod', latitude || null, longitude || null, notes || null]
            );
            const order_id = orderRes.insertId;

            for (let item of items) {
                let cake_id = parseInt(item.cake_id);
                if (isNaN(cake_id)) cake_id = 1;

                const weight = parseInt(item.size) || 1;
                await conn.query(
                    'INSERT INTO order_items (order_id, cake_id, qty, weight_lbs, purchase_price, subtotal, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [order_id, cake_id, item.qty, weight, item.price, item.price * item.qty, item.message || null]
                );
            }

            await conn.commit();
            return { order_id, status: 'Pending', total, created_at: new Date().toISOString() };
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    static async getByUserId(userId) {
        try {
            const [rows] = await pool.query(`
                SELECT * FROM orders WHERE user_id = ? ORDER BY order_id DESC
            `, [userId]);

            for (let order of rows) {
                const [items] = await pool.query(`
                    SELECT oi.*, c.name
                    FROM order_items oi
                    LEFT JOIN cakes c ON oi.cake_id = c.cake_id
                    WHERE oi.order_id = ?
                `, [order.order_id]);
                order.items = items.map(i => ({
                    name: i.name || 'Custom Cake',
                    qty: i.qty,
                    size: i.weight_lbs + ' lbs',
                    price: i.purchase_price,
                    message: i.message || ''
                }));
            }
            return rows;
        } catch (err) {
            console.error('Error fetching user orders:', err);
            return [];
        }
    }

    static async getAllAdmin() {
        try {
            const [rows] = await pool.query(`
                SELECT o.*, u.name as customer_name, u.email, u.phone
                FROM orders o
                LEFT JOIN users u ON o.user_id = u.user_id
                ORDER BY o.order_id DESC
            `);

            for (let order of rows) {
                const [items] = await pool.query(`
                    SELECT oi.*, c.name
                    FROM order_items oi
                    LEFT JOIN cakes c ON oi.cake_id = c.cake_id
                    WHERE oi.order_id = ?
                `, [order.order_id]);
                order.items = items.map(i => ({
                    name: i.name || 'Custom Cake',
                    qty: i.qty,
                    size: i.weight_lbs + ' lbs',
                    price: i.purchase_price,
                    message: i.message || ''
                }));
            }
            return rows;
        } catch (err) {
            console.error('Error fetching admin orders:', err);
            return [];
        }
    }

    static async updateStatus(orderId, status) {
        try {
            const [result] = await pool.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, orderId]);
            return result.affectedRows > 0;
        } catch (err) {
            console.error('Error updating order status:', err);
            throw err;
        }
    }
}

module.exports = Order;
