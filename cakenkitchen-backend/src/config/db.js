const mysql = require('mysql2/promise');
require('dotenv').config();

const poolConfig = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Auto-inject SSL settings if connecting to Aiven/Cloud (e.g. port changes or SSL explicitly requested)
if (process.env.MYSQL_SSL === 'true') {
    poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(poolConfig);

const testConnection = async () => {
    try {
        const conn = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        conn.release();
        await initializeDatabaseSchema();
        await seedCakesIfEmptyOrOld();
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
    }
};

const initializeDatabaseSchema = async () => {
    try {
        console.log('🔄 Checking/initializing database table schemas on Aiven Cloud...');

        // 1. Create Users Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                phone VARCHAR(15) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role ENUM('customer', 'admin') DEFAULT 'customer',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        `);

        try { await pool.query('ALTER TABLE users DROP INDEX phone'); } catch (e) { /* ignore if index doesn't exist */ }

        // 2. Create Categories Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS categories (
                cat_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) NOT NULL UNIQUE,
                description TEXT NULL,
                image_url VARCHAR(255) NULL
            ) ENGINE=InnoDB
        `);

        // 3. Create Cakes Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cakes (
                cake_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT NULL,
                base_price DECIMAL(10, 2) NOT NULL,
                cat_id INT NOT NULL,
                image_url LONGTEXT NULL,
                is_available BOOLEAN DEFAULT TRUE,
                FOREIGN KEY (cat_id) REFERENCES categories(cat_id) ON DELETE RESTRICT
            ) ENGINE=InnoDB
        `);
        
        try { await pool.query('ALTER TABLE cakes MODIFY image_url LONGTEXT NULL'); } catch (e) { }

        // 4. Create Orders Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                order_id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL,
                status ENUM('Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled') DEFAULT 'Pending',
                total DECIMAL(10, 2) NOT NULL,
                delivery_date DATE NOT NULL,
                delivery_address TEXT NOT NULL,
                delivery_time VARCHAR(50) NOT NULL,
                notes TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
            ) ENGINE=InnoDB
        `);

        // 5. Create Order Items Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                item_id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                cake_id INT NOT NULL,
                qty INT NOT NULL,
                weight_lbs INT NOT NULL,
                purchase_price DECIMAL(10, 2) NOT NULL,
                subtotal DECIMAL(10, 2) NOT NULL,
                message VARCHAR(255) NULL,
                FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
                FOREIGN KEY (cake_id) REFERENCES cakes(cake_id) ON DELETE RESTRICT
            ) ENGINE=InnoDB
        `);
        
        try { await pool.query('ALTER TABLE order_items ADD COLUMN message VARCHAR(255) NULL'); } catch (e) { }

        console.log('✅ Database tables verified and created successfully!');

        // 6. Seed Default Admin User if missing
        const [adminCheck] = await pool.query("SELECT COUNT(*) as count FROM users WHERE email = 'admin@cakenkitchen.com'");
        const adminHash = '$2b$10$NaAxlClTKnQ2ozmfg0F/quYMzc25E8lgCOnxOpfKU8PPyf3xWJxsi'; // hashes to 'admin123'
        if (adminCheck[0].count === 0) {
            console.log('🔄 Seeding default admin user...');
            await pool.query(`
                INSERT INTO users (name, email, phone, password_hash, role) VALUES
                ('Bakery Administrator', 'admin@cakenkitchen.com', '9801112223', ?, 'admin')
            `, [adminHash]);
            console.log('✅ Default admin user seeded successfully!');
        } else {
            console.log('ℹ️ Admin user already exists. Force updating password hash to ensure correctness...');
            await pool.query(`
                UPDATE users SET password_hash = ?, role = 'admin', name = 'Bakery Administrator' WHERE email = 'admin@cakenkitchen.com'
            `, [adminHash]);
            console.log('✅ Admin credentials updated and synced successfully!');
        }
    } catch (error) {
        console.error('⚠️ Database schema initialization failed:', error.message);
    }
};

const seedCakesIfEmptyOrOld = async () => {
    try {
        // Ensure categories exist first
        const [catCheck] = await pool.query('SELECT COUNT(*) as count FROM categories');
        if (catCheck[0].count === 0) {
            console.log('🔄 Seeding categories baseline data...');
            await pool.query(`
                INSERT INTO categories (cat_id, name, description, image_url) VALUES
                (1, 'Tiered Wedding Cakes', 'Multi-layered custom elegant structures for weddings.', 'wedding_category.jpg'),
                (2, 'Premium Chocolate Series', 'Rich, deep Dutch-process cocoa variants and ganache.', 'chocolate_category.jpg'),
                (3, 'Fresh Fruit Delights', 'Light sponge blocks layered with organic seasonal fruits.', 'fruit_category.jpg')
            `);
        }

        // Check if cakes already has the new 10 jpeg images
        const [rows] = await pool.query("SELECT COUNT(*) as count FROM cakes WHERE image_url LIKE '%.jpeg'");
        const count = rows[0].count;
        if (count < 10) {
            console.log('🔄 Auto-seeding database tables with 10 real WhatsApp cake images...');

            // Disable foreign key checks to make deletion safe
            await pool.query('SET FOREIGN_KEY_CHECKS = 0');
            await pool.query('DELETE FROM cakes');
            await pool.query('SET FOREIGN_KEY_CHECKS = 1');

            const seedQuery = `
                INSERT INTO cakes (cake_id, name, description, base_price, cat_id, image_url, is_available) VALUES
                (1, 'Classic Rose Anniversary', 'Double-tiered red velvet sponge with elegant white buttercream piping.', 1200.00, 1, 'Anniversary.jpeg', TRUE),
                (2, 'Luxury Golden Anniversary', 'Three-tier vanilla sponge accented with gold leaf sheets and white roses.', 2800.00, 1, 'Deluxe_Anniversary.jpeg', TRUE),
                (3, 'Elegant Floral Engagement', 'Delightful strawberry chiffon block garnished with delicate sugar flowers.', 1500.00, 1, 'Engagement_cake.jpeg', TRUE),
                (4, 'Bridal Lace White Forest', 'Traditional white forest base decorated with cream pearls and floral lace tiering.', 1800.00, 1, 'White_forest_anniversary.jpeg', TRUE),
                (5, 'Midnight Snow Birthday Cake', 'Rich chocolate cake with white snowflake frosting highlights.', 900.00, 2, 'snow_birthday_cake.jpeg', TRUE),
                (6, 'Royal Barbie Doll Birthday', 'Vanilla chiffon cake shaped beautifully like a barbie doll dress with pink frosting.', 1600.00, 2, 'Barbie_birthday.jpeg', TRUE),
                (7, 'Blueberry Cream Birthday Bliss', 'Zesty blueberry puree sponge layered with creamy heavy frosting toppings.', 950.00, 2, 'Blueberry_birthday.jpeg', TRUE),
                (8, 'Cricket Pitch Birthday Special', 'Green velvet grass-textured cake themed for cricket fans with fondant wickets.', 1100.00, 2, 'Cricket_birthday_cake.jpeg', TRUE),
                (9, 'Royal Baby Shower Dream', 'Light and fluffy strawberry card layers decorated with blue/pink cloud frosting.', 1350.00, 3, 'Baby_shower.jpeg', TRUE),
                (10, 'Artisanal Mother\'\'s Day Fondant', 'Heart-shaped strawberry cream cake dedicated with fondant calligraphy greetings.', 1000.00, 3, 'Mothers_day.jpeg', TRUE)
            `;
            await pool.query(seedQuery);
            console.log('✅ Auto-seeding completed successfully!');
        } else {
            console.log('ℹ️ Database already has all 10 real cake images.');
        }
    } catch (error) {
        console.error('⚠️ Database auto-seeding failed:', error.message);
    }
};

testConnection();
module.exports = pool;
