const pool = require('../config/db');

class Order {
    static async create(orderData) {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const {
                customer_name, email, phone, address, delivery_date,
<<<<<<< HEAD
                delivery_time, notes, payment_method, delivery_type, total, items,
                latitude, longitude
=======
                delivery_time, notes, payment_method, delivery_type, items
>>>>>>> 7b971a6ba803c5617d55fb6750a4b55fd2eeec6d
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

<<<<<<< HEAD
            const [orderRes] = await conn.query(
                'INSERT INTO orders (user_id, status, total, delivery_date, delivery_address, delivery_time, delivery_type, payment_method, latitude, longitude, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [user_id, 'Pending', total, delivery_date, address, delivery_time, delivery_type || 'standard', payment_method || 'cod', latitude || null, longitude || null, notes || null]
            );
            const order_id = orderRes.insertId;

            for (let item of items) {
                let cake_id = parseInt(item.cake_id);
                if (isNaN(cake_id)) cake_id = 1;

                const weight = parseInt(item.size) || 1;
=======
            // 2. Perform zero-trust server-side price validation
            let calculatedTotal = 0;
            const itemsWithPrices = [];

            for (let item of items) {
                const cake_id = item.cake_id || 1;
                const qty = parseInt(item.qty) || 1;
                const weight = parseInt(item.size) || 1;

                // Query database directly to secure prices config
                const [cakeRows] = await conn.query(
                    'SELECT base_price FROM cakes WHERE cake_id = ?',
                    [cake_id]
                );

                if (cakeRows.length === 0) {
                    throw new Error(`Product not found: ${cake_id}`);
                }

                // NPR Cake pricing = base price * weight factor (assuming 1 NPR base pricing multiplier per lbs)
                const authoritativePrice = parseFloat(cakeRows[0].base_price);
                const itemPrice = authoritativePrice * weight;
                const itemSubtotal = itemPrice * qty;

                calculatedTotal += itemSubtotal;
                itemsWithPrices.push({
                    cake_id,
                    qty,
                    weight_lbs: weight,
                    purchase_price: itemPrice,
                    subtotal: itemSubtotal,
                    message: item.message || null
                });
            }

            // 3. Insert Order Record utilizing calculated totals only
            const enhancedNotes = `Payment: ${payment_method} | Type: ${delivery_type} | ${notes || ''}`;
            const [orderRes] = await conn.query(
                'INSERT INTO orders (user_id, status, total, delivery_date, delivery_address, delivery_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [user_id, 'Pending', calculatedTotal, delivery_date, address, delivery_time, enhancedNotes]
            );
            const order_id = orderRes.insertId;

            // 4. Write verified items to DB
            for (let validatedItem of itemsWithPrices) {
>>>>>>> 7b971a6ba803c5617d55fb6750a4b55fd2eeec6d
                await conn.query(
                    'INSERT INTO order_items (order_id, cake_id, qty, weight_lbs, purchase_price, subtotal, message) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [
                        order_id,
                        validatedItem.cake_id,
                        validatedItem.qty,
                        validatedItem.weight_lbs,
                        validatedItem.purchase_price,
                        validatedItem.subtotal,
                        validatedItem.message
                    ]
                );
            }

            await conn.commit();
<<<<<<< HEAD
            return { order_id, status: 'Pending', total, created_at: new Date().toISOString() };
=======
            return { order_id, status: 'Pending', total: calculatedTotal, created_at: new Date().toISOString() };
>>>>>>> 7b971a6ba803c5617d55fb6750a4b55fd2eeec6d
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
<<<<<<< HEAD
                SELECT * FROM orders WHERE user_id = ? ORDER BY order_id DESC
            `, [userId]);

=======
                SELECT o.*, u.name as customer_name, u.email, u.phone 
                FROM orders o 
                LEFT JOIN users u ON o.user_id = u.user_id 
                ORDER BY o.order_id DESC
            `);

            // Fetch items for each
>>>>>>> 7b971a6ba803c5617d55fb6750a4b55fd2eeec6d
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
