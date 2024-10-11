// ========================================================
//    imported dependencies
// ========================================================
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import path from 'path';

// =======================
// Initialize Express App
// =======================
const app = express();

// ==============================
// Set up Middlewares
// ==============================

// Set Security HTTP Headers
app.use(helmet());

// Enable CORS
app.use(cors({ 
    credentials: true, 
    origin: process.env.FRONTEND_URL || '*' 
}));

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body Parser
app.use(express.json());

// Cookie Parser
app.use(cookieParser());

// Data Sanitization against NoSQL Injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// =======================
// Import Routes
// =======================
import authRoutes from './routes/auth.js';
// import userRoutes from './routes/users.js';
// import postRoutes from './routes/posts.js';


// =======================
// Use Routes
// =======================

app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/posts', postRoutes);

// =======================
// Import Middleware
// =======================
import { notFound, errorHandler } from './middleware/errorHandler.js';

// =======================
// 404 Handler
// =======================
app.use(notFound);

// =======================
// Global Error Handler
// =======================
app.use(errorHandler);

// =======================
// Export the App
// =======================
export default app;