// Simple, high-performance vanilla schema validator middleware
const validateRegistration = (req, res, next) => {
    const { name, email, phone, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
        return res.status(400).json({ success: false, error: 'Valid Name (max 100 chars) is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email) || email.length > 255) {
        return res.status(400).json({ success: false, error: 'Valid Email address is required' });
    }

    if (phone && (typeof phone !== 'string' || !/^\d{10,15}$/.test(phone))) {
        return res.status(400).json({ success: false, error: 'Phone must be a numeric string of 10 to 15 digits' });
    }

    if (!password || typeof password !== 'string' || password.length < 6 || password.length > 60) {
        return res.status(400).json({ success: false, error: 'Password must be between 6 and 60 characters' });
    }

    // Sanitize input to prevent script injection/html tags
    req.body.name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
    req.body.email = email.toLowerCase().trim();
    if (phone) req.body.phone = phone.trim();

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, error: 'Valid email is required' });
    }

    if (!password || typeof password !== 'string') {
        return res.status(400).json({ success: false, error: 'Password is required' });
    }

    req.body.email = email.toLowerCase().trim();

    next();
};

const validateOrder = (req, res, next) => {
    const {
        customer_name, email, phone, address, delivery_date,
        delivery_time, notes, payment_method, delivery_type, items
    } = req.body;

    if (!customer_name || typeof customer_name !== 'string' || customer_name.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Customer name is required' });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, error: 'Valid email is required' });
    }

    if (!phone || typeof phone !== 'string' || !/^\d{10,15}$/.test(phone)) {
        return res.status(400).json({ success: false, error: 'Valid phone number is required (10-15 digits)' });
    }

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Delivery address is required' });
    }

    if (!delivery_date || typeof delivery_date !== 'string') {
        return res.status(400).json({ success: false, error: 'Delivery date is required' });
    }

    if (!delivery_time || typeof delivery_time !== 'string') {
        return res.status(400).json({ success: false, error: 'Delivery time slot is required' });
    }

    const validMethods = ['cod', 'khalti', 'stripe', 'fonepay', 'esewa', 'card'];
    if (!payment_method || typeof payment_method !== 'string' || !validMethods.includes(payment_method.toLowerCase())) {
        return res.status(400).json({ success: false, error: 'Valid payment method is required' });
    }

    const validDeliveryTypes = ['delivery', 'pickup', 'standard', 'express'];
    if (!delivery_type || typeof delivery_type !== 'string' || !validDeliveryTypes.includes(delivery_type.toLowerCase())) {
        return res.status(400).json({ success: false, error: 'Valid delivery type is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'Order must contain at least one item' });
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.cake_id || typeof item.cake_id !== 'number') {
            return res.status(400).json({ success: false, error: `Invalid cake_id at item index ${i}` });
        }
        if (!item.qty || typeof item.qty !== 'number' || item.qty <= 0) {
            return res.status(400).json({ success: false, error: `Invalid quantity at item index ${i}` });
        }
        if (!item.size || (typeof item.size !== 'number' && typeof item.size !== 'string')) {
            return res.status(400).json({ success: false, error: `Invalid size at item index ${i}` });
        }
        if (item.message && typeof item.message !== 'string') {
            return res.status(400).json({ success: false, error: `Invalid message format at item index ${i}` });
        }
    }

    // Sanitize string contents to prevent stored HTML/XSS
    req.body.customer_name = customer_name.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
    req.body.email = email.toLowerCase().trim();
    req.body.phone = phone.trim();
    req.body.address = address.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
    req.body.notes = (notes || '').replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();

    // Sanitize item messages
    req.body.items = items.map(item => ({
        ...item,
        message: item.message ? item.message.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim() : ''
    }));

    next();
};

const validateCake = (req, res, next) => {
    const { name, description, base_price, cat_id, image_url } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Cake name is required' });
    }

    if (typeof base_price !== 'number' || base_price <= 0) {
        return res.status(400).json({ success: false, error: 'Base price must be a positive number' });
    }

    if (typeof cat_id !== 'number') {
        return res.status(400).json({ success: false, error: 'Category ID must be a number' });
    }

    // Sanitize
    req.body.name = name.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
    req.body.description = (description || '').replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
    if (image_url) req.body.image_url = image_url.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();

    next();
};

module.exports = {
    validateRegistration,
    validateLogin,
    validateOrder,
    validateCake
};
