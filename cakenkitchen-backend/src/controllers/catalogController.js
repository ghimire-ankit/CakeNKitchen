const Category = require('../models/Category');
const Cake = require('../models/Cake');

const getCategories = async (req, res) => {
    try {
        const categories = await Category.getAll();
        res.json({ success: true, count: categories.length, data: categories });
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve categories' });
    }
};

const getCakes = async (req, res) => {
    try {
        const { catId } = req.query;
        let cakes;
        if (catId) {
            cakes = await Cake.getByCategoryId(catId);
        } else {
            cakes = await Cake.getAll();
        }
        res.json({ success: true, count: cakes.length, data: cakes });
    } catch (err) {
        console.error('Error fetching cakes:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve cakes' });
    }
};

const getCakeById = async (req, res) => {
    try {
        const { id } = req.params;
        const cake = await Cake.getById(id);
        if (!cake) {
            return res.status(404).json({ success: false, error: 'Cake not found' });
        }
        res.json({ success: true, data: cake });
    } catch (err) {
        console.error('Error fetching cake detail:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve cake detail' });
    }
};

module.exports = { getCategories, getCakes, getCakeById };
