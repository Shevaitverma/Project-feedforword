import jwt from 'jsonwebtoken';

/**
 * Generate JWT Token
 *
 * @param {Object} payload - The payload to encode in the token.
 * @param {String} expiresIn - Token expiration time.
 * @returns {String} - Signed JWT token.
 */
export const generateToken = (payload, expiresIn = '7d') => {
    return jwt.sign(payload, process.env.JWT_SECRETE, { expiresIn });
};

/**
 * Verify JWT Token
 *
 * @param {String} token - The token to verify.
 * @returns {Object} - Decoded token payload.
 * @throws {Error} - If token is invalid or expired.
 */
export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRETE);
};
