import transporter from '../config/email.js';

/**
 * Send Verification Email
 *
 * @param {String} email - Recipient's email address.
 * @param {String} verificationUrl - URL for email verification.
 */
export const sendVerificationEmail = async (email, verificationUrl) => {
    const message = `
        <h1>Email Verification</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" clicktracking=off>${verificationUrl}</a>
    `;

    await transporter.sendMail({
        from: `"FeedForward Support" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: 'Email Verification - FeedForward',
        html: message,
    });
};

/**
 * Send Password Reset Email
 *
 * @param {String} email - Recipient's email address.
 * @param {String} resetUrl - URL for password reset.
 */
export const sendPasswordResetEmail = async (email, resetUrl) => {
    const message = `
        <h1>Password Reset</h1>
        <p>Please reset your password by clicking the link below:</p>
        <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
    `;

    await transporter.sendMail({
        from: `"FeedForward Support" <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: 'Password Reset - FeedForward',
        html: message,
    });
};
