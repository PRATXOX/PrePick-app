// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Step A: Controller Import karo
const authController = require('../controllers/authController');

// Step B: Route ko Controller function se jodo
// Dhyan dein: '.register' function call ho raha hai
router.post('/register', authController.register);

router.post('/login', authController.login);
router.post('/check-username', authController.checkUsername);

module.exports = router;