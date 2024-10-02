import crypto from 'crypto';

export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// In a real application, you'd want to store OTPs securely, possibly in the database
// with an expiration time. This is a simplified version.
const otpStore = new Map();

export const storeOTP = (email, otp) => {
  otpStore.set(email, otp);
};

export const verifyOTP = (email, otp) => {
  return otpStore.get(email) === otp;
};