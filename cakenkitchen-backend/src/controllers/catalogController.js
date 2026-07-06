const Category = require('../models/Category');
const Cake = require('../models/Cake');
const Order = require('../models/Order');

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

const getAdminCakes = async (req, res) => {
    try {
        const cakes = await Cake.getAdminAll();
        res.json({ success: true, count: cakes.length, data: cakes });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to retrieve admin cakes' });
    }
};

const createCake = async (req, res) => {
    try {
        const id = await Cake.create(req.body);
        res.json({ success: true, cake_id: id });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to create cake' });
    }
};

const toggleCake = async (req, res) => {
    try {
        const success = await Cake.toggleAvailability(req.params.id);
        res.json({ success });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to toggle cake' });
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

const createOrder = async (req, res) => {
    try {
        const order = await Order.create(req.body);
        res.json({ success: true, data: order });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ success: false, error: 'Failed to place order' });
    }
};

const getAdminOrders = async (req, res) => {
    try {
        const orders = await Order.getAllAdmin();
        res.json({ success: true, data: orders });
    } catch (err) {
        console.error('Error fetching admin orders:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve admin orders' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const success = await Order.updateStatus(req.params.id, req.body.status);
        res.json({ success });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Failed to update order status' });
    }
};

module.exports = { getCategories, getCakes, getAdminCakes, createCake, toggleCake, getCakeById, createOrder, getAdminOrders, updateOrderStatus };
