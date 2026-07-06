const pool = require('../config/db');

class Cake {
    static async getAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM cakes WHERE is_available = TRUE');
            if (!rows || rows.length === 0) {
                return Cake.getMockCakes();
            }
            return rows;
        } catch (err) {
            console.warn('⚠️ Database query failed, using mock cakes:', err.message);
            return Cake.getMockCakes();
        }
    }

    static async getByCategoryId(catId) {
        try {
            const [rows] = await pool.query('SELECT * FROM cakes WHERE cat_id = ? AND is_available = TRUE', [catId]);
            if (!rows || rows.length === 0) {
                return Cake.getMockCakes().filter(cake => cake.cat_id == catId);
            }
            return rows;
        } catch (err) {
            console.warn('⚠️ Database query failed, filtering mock cakes:', err.message);
            return Cake.getMockCakes().filter(cake => cake.cat_id == catId);
        }
    }

    static async getById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM cakes WHERE cake_id = ?', [id]);
            if (!rows || rows.length === 0) {
                return Cake.getMockCakes().find(cake => cake.cake_id == id);
            }
            return rows[0];
        } catch (err) {
            console.warn('⚠️ Database query failed, finding mock cake:', err.message);
            return Cake.getMockCakes().find(cake => cake.cake_id == id);
        }
    }

    static async getAdminAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM cakes ORDER BY cake_id DESC');
            return rows;
        } catch (err) {
            console.error('Error fetching admin cakes:', err);
            return [];
        }
    }

    static async create(cake) {
        const { name, description, base_price, cat_id, image_url, is_available } = cake;
        try {
            const [result] = await pool.query(
                'INSERT INTO cakes (name, description, base_price, cat_id, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?)',
                [name, description, base_price, cat_id, image_url, is_available ? 1 : 0]
            );
            return result.insertId;
        } catch (err) {
            console.error('Error creating cake:', err);
            throw err;
        }
    }

    static async toggleAvailability(id) {
        try {
            const [result] = await pool.query('UPDATE cakes SET is_available = NOT is_available WHERE cake_id = ?', [id]);
            return result.affectedRows > 0;
        } catch (err) {
            console.error('Error toggling availability:', err);
            throw err;
        }
    }

    static getMockCakes() {
        return [
            { cake_id: 1, name: 'Classic Rose Anniversary', description: 'Double-tiered red velvet sponge with elegant white buttercream piping.', base_price: 1200.00, cat_id: 1, image_url: 'Anniversary.jpeg', is_available: true },
            { cake_id: 2, name: 'Luxury Golden Anniversary', description: 'Three-tier vanilla sponge accented with gold leaf sheets and white roses.', base_price: 2800.00, cat_id: 1, image_url: 'Deluxe_Anniversary.jpeg', is_available: true },
            { cake_id: 3, name: 'Elegant Floral Engagement', description: 'Delightful strawberry chiffon block garnished with delicate sugar flowers.', base_price: 1500.00, cat_id: 1, image_url: 'Engagement_cake.jpeg', is_available: true },
            { cake_id: 4, name: 'Bridal Lace White Forest', description: 'Traditional white forest base decorated with cream pearls and floral lace tiering.', base_price: 1800.00, cat_id: 1, image_url: 'White_forest_anniversary.jpeg', is_available: true },
            { cake_id: 5, name: 'Midnight Snow Birthday Cake', description: 'Rich chocolate cake with white snowflake frosting highlights.', base_price: 900.00, cat_id: 2, image_url: 'snow_birthday_cake.jpeg', is_available: true },
            { cake_id: 6, name: 'Royal Barbie Doll Birthday', description: 'Vanilla chiffon cake shaped beautifully like a barbie doll dress with pink frosting.', base_price: 1600.00, cat_id: 2, image_url: 'Barbie_birthday.jpeg', is_available: true },
            { cake_id: 7, name: 'Blueberry Cream Birthday Bliss', description: 'Zesty blueberry puree sponge layered with creamy heavy frosting toppings.', base_price: 950.00, cat_id: 2, image_url: 'Blueberry_birthday.jpeg', is_available: true },
            { cake_id: 8, name: 'Cricket Pitch Birthday Special', description: 'Green velvet grass-textured cake themed for cricket fans with fondant wickets.', base_price: 1100.00, cat_id: 2, image_url: 'Cricket_birthday_cake.jpeg', is_available: true },
            { cake_id: 9, name: 'Royal Baby Shower Dream', description: 'Light and fluffy strawberry card layers decorated with blue/pink cloud frosting.', base_price: 1350.00, cat_id: 3, image_url: 'Baby_shower.jpeg', is_available: true },
            { cake_id: 10, name: 'Artisanal Mother\'s Day Fondant', description: 'Heart-shaped strawberry cream cake dedicated with fondant calligraphy greetings.', base_price: 1000.00, cat_id: 3, image_url: 'Mothers_day.jpeg', is_available: true }
        ];
    }
}

module.exports = Cake;
