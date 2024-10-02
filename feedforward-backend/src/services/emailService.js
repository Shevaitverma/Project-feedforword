import transporter from '../config/email.js';

export const sendVerificationEmail = async (to, otp) => {
  const mailOptions = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to,
    subject: 'Email Verification',
    html: `<p>Your verification code is: <strong>${otp}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};