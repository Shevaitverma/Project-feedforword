// src/routes/auth.js

import express from 'express';
const router = express.Router();
import authController from '../controllers/authController';

// @route   POST /api/v1/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/v1/auth/login
// @desc    Login user and return JWT token
// @access  Public
router.post('/login', authController.login);

// @route   POST /api/v1/auth/logout
// @desc    Logout user and invalidate session
// @access  Private
router.post('/logout', authController.logout);

// @route   GET /api/v1/auth/verify-email
// @desc    Verify user's email address
// @access  Public
router.get('/verify-email', authController.verifyEmail);

// @route   POST /api/v1/auth/forgot-password
// @desc    Initiate password reset
// @access  Public
router.post('/forgot-password', authController.forgotPassword);

// @route   POST /api/v1/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', authController.resetPassword);

module.exports = router;
