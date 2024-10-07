// src/controllers/authController.js
import User from '../models/User';
import Session from '../models/Session';
import { signToken, verifyToken } from '../utils/jwtUtils';
import emailService from '../services/emailService';
import otpService from '../services/otpService';

// Register a new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, username, password } = req.body;

    // Create user
    const newUser = await User.create({
      name,
      email,
      username,
      password
    });

    // Generate email verification token
    const emailToken = signToken({ id: newUser._id }, '1d');

    // Send verification email
    await emailService.sendVerificationEmail(newUser.email, emailToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          username: newUser.username,
          isVerified: newUser.isVerified,
        },
      },
    });
  } catch (error) {
    // Handle duplicate key error for email or username
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ success: false, message: `The ${field} is already in use.` });
    }
    next(error);
  }
};

// Login user and create session
exports.login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email before logging in.' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = signToken({ id: user._id });

    // Create session
    const session = await Session.create({
      userId: user._id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.status(200).json({
      success: true,
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          bio: user.bio,
          interests: user.interests,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Logout user and invalidate session
exports.logout = async (req, res, next) => {
  try {
    const token = req.token; // Retrieved from auth middleware

    // Delete session
    await Session.findOneAndDelete({ token });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Verify user's email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is missing.' });
    }

    // Verify token
    const decoded = verifyToken(token);
    const userId = decoded.id;

    // Update user's verification status
    const user = await User.findByIdAndUpdate(userId, { isVerified: true }, { new: true });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token or user does not exist.' });
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Initiate password reset
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User with this email does not exist.' });
    }

    // Generate password reset token
    const resetToken = signToken({ id: user._id }, '1h');

    // Send password reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent.',
    });
  } catch (error) {
    next(error);
  }
};

// Reset password using token
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Reset token is missing.' });
    }

    // Verify token
    const decoded = verifyToken(token);
    const userId = decoded.id;

    // Find user and update password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid token or user does not exist.' });
    }

    user.password = newPassword;
    await user.save();

    // Optionally, invalidate all existing sessions for the user
    await Session.deleteMany({ userId: user._id });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully.',
    });
  } catch (error) {
    next(error);
  }
};
