const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
    try {
        const { userId, role } = req.query;
        let notifications = [];
        
        if (role === 'admin') {
            notifications = await Notification.getAdminNotifications();
        } else if (userId) {
            notifications = await Notification.getByUserId(userId);
        } else {
            return res.status(400).json({ success: false, error: 'User ID or Admin role required' });
        }
        
        res.json({ success: true, count: notifications.length, data: notifications });
    } catch (err) {
        console.error('Error in getNotifications:', err);
        res.status(500).json({ success: false, error: 'Failed to retrieve notifications' });
    }
};

const markAsRead = async (req, res) => {
    try {
        const id = req.params.id;
        const success = await Notification.markAsRead(id);
        res.json({ success });
    } catch (err) {
        console.error('Error in markAsRead:', err);
        res.status(500).json({ success: false, error: 'Failed to mark as read' });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const targetUserId = role === 'admin' ? null : userId;
        const success = await Notification.markAllAsRead(targetUserId);
        res.json({ success });
    } catch (err) {
        console.error('Error in markAllAsRead:', err);
        res.status(500).json({ success: false, error: 'Failed to mark all as read' });
    }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
