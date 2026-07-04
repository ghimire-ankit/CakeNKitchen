require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Global Middleware Security & Data Parsing Pipelines
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Main API Routing Modules
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api', require('./src/routes/catalogRoutes'));

// 3. Operational System Baseline Health Check Route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🎂 CakeNKitchen API is running!',
        version: '1.0.0'
    });
});

// 4. Global 404 Route Fallback Exception Interceptor
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`
    });
});

// 5. Centralized System Error Pipeline (Catches all unexpected runtime faults)
app.use((err, req, res, next) => {
    console.error('❌ System Fault Captured:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// 6. Launch Application Network Server
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 CakeNKitchen Server Active On Port: ${PORT}`);
    console.log(`📡 Environment Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`========================================`);
});