require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust reverse proxy (Render / Vercel rate-limiting support)
app.set('trust proxy', 1);

// 1. Global Middleware Security & Data Parsing Pipelines
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", "http://localhost:*", "https://*.vercel.app"],
            imgSrc: ["'self'", "data:", "https://*", "http://localhost:*"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"]
        }
    }
}));
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

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 100, // max 100 requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many authentication attempts, please try again after 15 minutes.' }
});

const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: 30, // max 30 order requests per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many order requests from this IP, please try again after 15 minutes.' }
});

app.use('/api/auth', authLimiter);
app.use('/api/orders', orderLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api', require('./src/routes/catalogRoutes'));

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🎂 CakeNKitchen API is running!',
        version: '1.0.0'
    });
});

app.get('/api/health', async (req, res) => {
    try {
        const dbPool = require('./src/config/db');
        const [rows] = await dbPool.query('SELECT 1 + 1 AS solution');
        res.json({
            success: true,
            database: 'Connected successfully',
            solution: rows[0].solution
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Database connection failed: ' + err.message
        });
    }
});

// 4. Global 404 Route Fallback Exception Interceptor
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