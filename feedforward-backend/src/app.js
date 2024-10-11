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
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
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
    max: 50, // Limit each IP to 50 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter); // we can also add limiter globally to all routes or any specific route
// app.use(limiter);  // --->>>  this is a global limiter

// Load Swagger Document
const swaggerDocument = YAML.load(path.join(process.cwd(), 'src/docs/api/api-spec.yaml'));


// Use Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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