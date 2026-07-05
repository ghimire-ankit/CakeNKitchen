const mysql = require('mysql2/promise');
require('dotenv').config({ path: './cakenkitchen-backend/.env' });

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3306
});

async function run() {
    try {
        const [rows] = await pool.query('SELECT user_id, name, email, role, password_hash FROM users');
        console.log('USERS:', rows);
        pool.end();
    } catch (err) {
        console.error('ERROR:', err.message);
    }
}
run();
