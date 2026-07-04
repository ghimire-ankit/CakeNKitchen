const pool = require('../config/db');

class Category {
    static async getAll() {
        try {
            const [rows] = await pool.query('SELECT * FROM categories');
            if (!rows || rows.length === 0) {
                return Category.getMockCategories();
            }
            return rows;
        } catch (err) {
            console.warn('⚠️ Database query failed, using mock categories:', err.message);
            return Category.getMockCategories();
        }
    }

    static getMockCategories() {
        return [
            { cat_id: 1, name: 'Tiered Wedding Cakes', description: 'Multi-layered custom elegant structures for weddings.', image_url: 'wedding_category.jpg' },
            { cat_id: 2, name: 'Premium Chocolate Series', description: 'Rich, deep Dutch-process cocoa variants and ganache.', image_url: 'chocolate_category.jpg' },
            { cat_id: 3, name: 'Fresh Fruit Delights', description: 'Light sponge blocks layered with organic seasonal fruits.', image_url: 'fruit_category.jpg' }
        ];
    }
}

module.exports = Category;
