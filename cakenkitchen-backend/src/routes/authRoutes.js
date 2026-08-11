const express = require('express');
const { register, login, googleLogin } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validator');

const router = express.Router();
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/google', googleLogin);

module.exports = router;
