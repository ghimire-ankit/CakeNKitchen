const pool = require('../config/db');

class Order {
    static async create(orderData) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const { 
                customer_name, email, phone, address, delivery_date, 
                delivery_time, notes, payment_method, delivery_type, total, items 
            } = orderData;

            // 1. Check if user exists by email, if not create a stub user
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

            // 2. Insert Order
            // Wait, our DB schema doesn't have customer_name, email, phone, payment_method, delivery_type on the orders table directly?
            // Let's check schema.sql or db.js.
            // In db.js: user_id, status, total, delivery_date, delivery_address, delivery_time, notes
            // I should alter the table if payment_method and delivery_type are missing, or store them in notes for now to avoid schema changes.
            // Actually, we can alter the table right here or in db.js. Let's just add them if they don't exist, or safely ignore and put in notes.
            // Let's put payment_method and delivery_type in notes for simplicity without breaking schema.
            const enhancedNotes = `Payment: ${payment_method} | Type: ${delivery_type} | ${notes || ''}`;

            const [orderRes] = await conn.query(
                'INSERT INTO orders (user_id, status, total, delivery_date, delivery_address, delivery_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [user_id, 'Pending', total, delivery_date, address, delivery_time, enhancedNotes]
            );
            const order_id = orderRes.insertId;

            // 3. Insert Items
            for (let item of items) {
                // schema: order_id, cake_id, qty, weight_lbs, purchase_price, subtotal, message
                const cake_id = item.cake_id || 1; // fallback if not provided
                const weight = parseInt(item.size) || 1;
                await conn.query(
                    'INSERT INTO order_items (order_id, cake_id, qty, weight_lbs, purchase_price, subtotal, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [order_id, cake_id, item.qty, weight, item.price, item.price * item.qty, item.message || null]
                );
            }

            await conn.commit();
            
            // Re-fetch the fully formed order for the frontend
            return { order_id, status: 'Pending', total, created_at: new Date().toISOString() };
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    static async getAllAdmin() {
        try {
            // Join with users to get name/email/phone
            const [rows] = await pool.query(`
                SELECT o.*, u.name as customer_name, u.email, u.phone 
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.user_id 
                ORDER BY o.order_id DESC
            `);
            
            // Fetch items for each
            for (let order of rows) {
                const [items] = await pool.query(`
                    SELECT oi.*, c.name 
                    FROM order_items oi 
                    JOIN cakes c ON oi.cake_id = c.cake_id 
                    WHERE oi.order_id = ?
                `, [order.order_id]);
                order.items = items.map(i => ({
                    name: i.name,
                    qty: i.qty,
                    size: i.weight_lbs + ' lbs',
                    price: i.purchase_price,
                    message: i.message || '' // Include message from DB
                }));
                // parse notes back
                order.notes_clean = order.notes;
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
