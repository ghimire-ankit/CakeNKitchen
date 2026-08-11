const Category = require('../models/Category');
const Cake = require('../models/Cake');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const pool = require('../config/db');

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
        const cakeData = { ...req.body };
        if (req.file) {
            cakeData.image_url = req.file.filename;
        }
        if (!cakeData.image_url) {
             cakeData.image_url = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500';
        }
        
        const id = await Cake.create(cakeData);
        res.json({ success: true, cake_id: id });
    } catch (err) {
        console.error('Error creating cake:', err);
        res.status(500).json({ success: false, error: err.message || 'Failed to create cake' });
    }
};

const updateCake = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = { ...req.body };

        if (req.file) {
            // Delete old image from disk if it exists
            const oldCake = await Cake.getById(id);
            if (oldCake && oldCake.image_url && !oldCake.image_url.startsWith('http')) {
                const fs = require('fs');
                const path = require('path');
                const oldPath = path.join(__dirname, '../../public/uploads', oldCake.image_url);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            updateData.image_url = req.file.filename;
        }

        const success = await Cake.update(id, updateData);
        res.json({ success });
    } catch (err) {
        console.error('Error updating cake:', err);
        res.status(500).json({ success: false, error: err.message || 'Failed to update cake' });
    }
};

const deleteCake = async (req, res) => {
    try {
        const id = req.params.id;
        const cake = await Cake.getById(id);
        
        if (cake && cake.image_url && !cake.image_url.startsWith('http')) {
            const fs = require('fs');
            const path = require('path');
            const imagePath = path.join(__dirname, '../../public/uploads', cake.image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log(`🗑️ Deleted image file from disk: ${cake.image_url}`);
            }
        }
        
        const success = await Cake.delete(id);
        res.json({ success });
    } catch (err) {
        console.error('Error deleting cake:', err);
        res.status(500).json({ success: false, error: 'Failed to delete cake' });
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
        
        // Notify admin about new order
        if (order && order.order_id) {
            await Notification.create({
                user_id: null, // admin
                title: 'New Order Received',
                message: `Order #${order.order_id} has been placed for Rs ${order.total}.`
            });
        }

        res.json({ success: true, data: order });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ success: false, error: 'Failed to place order' });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.getByUserId(userId);
        res.json({ success: true, data: orders });
    } catch (err) {
        console.error('Error fetching user orders:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve orders' });
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
        
        if (success) {
            // Get user_id for this order
            const [rows] = await pool.query('SELECT user_id FROM orders WHERE order_id = ?', [req.params.id]);
            if (rows.length > 0 && rows[0].user_id) {
                // Notify user about status change
                await Notification.create({
                    user_id: rows[0].user_id,
                    title: 'Order Update',
                    message: `Your Order #${req.params.id} is now: ${req.body.status}`
                });
            }
        }
        
        res.json({ success });
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ success: false, error: 'Failed to update order status' });
    }
};

module.exports = { getCategories, getCakes, getAdminCakes, createCake, updateCake, deleteCake, toggleCake, getCakeById, createOrder, getUserOrders, getAdminOrders, updateOrderStatus };

