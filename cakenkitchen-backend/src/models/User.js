const pool = require('../config/db');

class User {
    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await pool.query('SELECT user_id, name, email, phone, role FROM users WHERE user_id = ?', [id]);
        return rows[0];
    }

    static async create({ name, email, phone, password_hash }) {
        const [result] = await pool.query('INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)', [name, email, phone, password_hash]);
        return result.insertId;
    }
}

module.exports = User;
