import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

const app = express();

// Middleware
app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// routes


// error handling


export default app;