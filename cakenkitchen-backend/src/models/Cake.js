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

    static getMockCakes() {
        return [
            { cake_id: 1, name: 'Midnight Chocolate Fudge', description: 'Triple-layer dark cocoa cake smothered in rich Belgian chocolate ganache.', base_price: 750.00, cat_id: 2, image_url: 'midnight_fudge.jpg', is_available: true },
            { cake_id: 2, name: 'Classic Black Forest', description: 'Traditional German chocolate sponge layered with whipped cream and sweet cherries.', base_price: 650.00, cat_id: 2, image_url: 'black_forest.jpg', is_available: true },
            { cake_id: 3, name: 'Royal Strawberry Infusion', description: 'Vanilla chiffon cake layered with fresh local strawberries and vanilla bean cream.', base_price: 800.00, cat_id: 3, image_url: 'strawberry_royal.jpg', is_available: true },
            { cake_id: 4, name: 'White Orchid Elegant Tier', description: 'Three-tier vanilla sponge accented with white buttercream roses.', base_price: 2500.00, cat_id: 1, image_url: 'wedding_orchid.jpg', is_available: true }
        ];
    }
}

module.exports = Cake;
