const pool = require('../config/db');

class Notification {
    static async create(data) {
        const { user_id, title, message } = data;
        try {
            const [result] = await pool.query(
                'INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)',
                [user_id || null, title, message]
            );
            return result.insertId;
        } catch (err) {
            console.error('Error creating notification:', err);
            throw err;
        }
    }

    static async getByUserId(userId) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
                [userId]
            );
            return rows;
        } catch (err) {
            console.error('Error fetching notifications:', err);
            throw err;
        }
    }

    static async getAdminNotifications() {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM notifications WHERE user_id IS NULL ORDER BY created_at DESC'
            );
            return rows;
        } catch (err) {
            console.error('Error fetching admin notifications:', err);
            throw err;
        }
    }

    static async markAsRead(id) {
        try {
            const [result] = await pool.query(
                'UPDATE notifications SET is_read = TRUE WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (err) {
            console.error('Error marking notification as read:', err);
            throw err;
        }
    }
    
    static async markAllAsRead(userId) {
        try {
            if (userId) {
                const [result] = await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
                return result.affectedRows > 0;
            } else {
                const [result] = await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id IS NULL');
                return result.affectedRows > 0;
            }
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            throw err;
        }
    }
}

module.exports = Notification;
