import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify the transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log(`Email transporter configuration error: ${error}`);
  } else {
    console.log('Email transporter is configured correctly');
  }
});

export default transporter;