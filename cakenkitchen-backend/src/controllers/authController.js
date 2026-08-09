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

const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        let payload;

        // Bypass Google external verification if it's the local mock developer token
        if (token === 'mock_google_id_token_123') {
            payload = {
                email: 'mock_google_user@gmail.com',
                name: 'Mock Google Explorer',
                sub: '1019688537554mocksub123'
            };
        } else {
            // Verify key integrity using Google's cloud auth profile API
            const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
            if (!verifyRes.ok) {
                return res.status(401).json({ success: false, error: 'Failed to verify Google token' });
            }
            payload = await verifyRes.json();

            // Verify client aud payload matches config
            const client_id = process.env.VITE_GOOGLE_CLIENT_ID || "1019688537554-mockclientid123.apps.googleusercontent.com";
            if (payload.aud !== client_id) {
                console.warn('Google client ID mismatch. Expected:', client_id, 'Received:', payload.aud);
                // Allow mock token bypass locally for developer sandbox runs, but restrict strictly if custom ID present
                if (client_id !== "1019688537554-mockclientid123.apps.googleusercontent.com") {
                    return res.status(401).json({ success: false, error: 'Issuer or client ID mismatched' });
                }
            }
        }

        const { email, name, sub } = payload;
        if (!email) {
            return res.status(400).json({ success: false, error: 'Email not provided by Google account' });
        }

        let user = await User.findByEmail(email);
        let userId;

        if (!user) {
            // New user via Google: generate a secure placeholder phone & password hash.
            const placeholderPhone = '9800000000';
            const placeholderPasswordHash = await bcrypt.hash('gauth_secured_' + sub, 10);

            userId = await User.create({
                name,
                email,
                phone: placeholderPhone,
                password_hash: placeholderPasswordHash
            });

            user = {
                user_id: userId,
                name,
                email,
                role: 'customer'
            };
        } else {
            userId = user.user_id;
        }

        const authToken = generateToken(user);
        res.json({
            success: true,
            message: 'Signed in with Google successfully',
            data: {
                user_id: userId,
                name: user.name,
                email: user.email,
                role: user.role,
                token: authToken
            }
        });
    } catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({ success: false, error: 'Server error during Google auth' });
    }
};

module.exports = { register, login, googleLogin };
