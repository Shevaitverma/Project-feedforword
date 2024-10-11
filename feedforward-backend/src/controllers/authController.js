import User from '../models/User.js';
import Session from '../models/Session.js';
import jwt from 'jsonwebtoken';
import transporter from '../config/email.js';
import crypto from 'crypto';

/**
 * Register a new user
 *
 * Route: POST /api/v1/auth/register
 * Access: Public
 */
export const register = async (req, res, next) => {
    try {
        const { name, email, username, password, avatar, bio, interests } = req.body;

        // Check if email or username already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email or Username already exists' });
        }

        const newUser = await User.create({
            name,
            email,
            username,
            password,
            avatar,
            bio,
            interests,
        });

        // Generate email verification token
        const verificationToken = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Send verification email
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const message = `
            <h1>Email Verification</h1>
            <p>Please verify your email by clicking the link below:</p>
            <a href="${verificationUrl}" clicktracking=off>${verificationUrl}</a>
        `;

        await transporter.sendMail({
            from: `"FeedForward Support" <${process.env.SMTP_USER}>`,
            to: newUser.email,
            subject: 'Email Verification - FeedForward',
            html: message,
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email to verify your account.',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user and create session
 *
 * Route: POST /api/v1/auth/login
 * Access: Public
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email and password
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: 'Please verify your email before logging in' });
        }

        // Create JWT Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Create session
        const session = await Session.create({
            userId: user._id,
            token,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        // Set token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    avatar: user.avatar,
                    bio: user.bio,
                    interests: user.interests,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Logout user and invalidate session
 *
 * Route: POST /api/v1/auth/logout
 * Access: Private
 */
export const logout = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (token) {
            // Remove session from database
            await Session.findOneAndDelete({ token });

            // Clear cookie
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
        }

        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Verify user's email address
 *
 * Route: GET /api/v1/auth/verify-email?token=...
 * Access: Public
 */
export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Invalid or missing token' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user and update verification status
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }

        if (user.isVerified) {
            return res.status(400).json({ success: false, message: 'Email already verified' });
        }

        user.isVerified = true;
        await user.save();

        res.status(200).json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Initiate password reset
 *
 * Route: POST /api/v1/auth/forgot-password
 * Access: Public
 */
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please provide your email' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'There is no user with that email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to user
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set reset token and expiration
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const message = `
            <h1>Password Reset</h1>
            <p>Please reset your password by clicking the link below:</p>
            <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
        `;

        // Send email
        await transporter.sendMail({
            from: `"FeedForward Support" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: 'Password Reset - FeedForward',
            html: message,
        });

        res.status(200).json({ success: true, message: 'Password reset email sent' });
    } catch (error) {
        next(error);
    }
};

/**
 * Reset password using token
 *
 * Route: POST /api/v1/auth/reset-password
 * Access: Public
 */
export const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ success: false, message: 'Invalid request' });
        }

        // Hash token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user by reset token and check expiration
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // Update password and clear reset fields
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};
