require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Server initialization

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'https://cake-n-kitchen.vercel.app'
];

if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(new Error('CORS access blocked for origin: ' + origin));
        }
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));
app.use('/api', require('./src/routes/catalogRoutes'));

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🎂 CakeNKitchen API is running!',
        version: '1.0.0'
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`
    });
});

app.use((err, req, res, next) => {
    console.error('❌ System Fault Captured:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 CakeNKitchen Server Active On Port: ${PORT}`);
    console.log(`📡 Environment Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`========================================`);
});