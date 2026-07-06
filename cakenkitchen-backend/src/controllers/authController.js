const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
    return jwt.sign(
        { user_id: user.user_id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
        }
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(409).json({ success: false, error: 'Email already registered' });
        }
        if (phone) {
            const existingPhone = await User.findByPhone(phone);
            if (existingPhone) {
                return res.status(409).json({ success: false, error: 'Phone number already registered' });
            }
        }
        const password_hash = await bcrypt.hash(password, 10);
        const userId = await User.create({ name, email, phone, password_hash });
        const token = generateToken({ user_id: userId, email, role: 'customer' });
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: { user_id: userId, name, email, role: 'customer', token }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ success: false, error: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        const token = generateToken(user);
        res.json({
            success: true,
            message: 'Login successful',
            data: { user_id: user.user_id, name: user.name, email: user.email, role: user.role, token }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, error: 'Server error during login' });
    }
};

module.exports = { register, login };
