// src/middleware/errorHandler.js

import mongoose from 'mongoose';
import logger from '../config/logger.js';

/**
 * notFound Middleware
 *
 * Handles 404 errors for undefined routes.
 */
export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * errorHandler Middleware
 *
 * Handles all errors globally and formats the response.
 */
export const errorHandler = (err, req, res, next) => {
    // If response status code is 200, set it to 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    // Log the error
    logger.error(`${req.method} ${req.originalUrl} ${statusCode} - ${err.message}`, {
        stack: err.stack,
    });

    // Construct error response
    const response = {
        success: false,
        message: err.message || 'Internal Server Error',
    };

    // Include stack trace only in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    // Handle specific Mongoose errors
    if (err.name === 'ValidationError') {
        response.message = Object.values(err.errors).map(val => val.message).join(', ');
        res.status(400);
    }

    if (err.code && err.code === 11000) {
        const field = Object.keys(err.keyValue);
        response.message = `Duplicate field value entered for ${field}: "${err.keyValue[field]}"`;
        res.status(400);
    }

    if (err.name === 'CastError') {
        response.message = `Invalid ${err.path}: ${err.value}`;
        res.status(400);
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        response.message = 'Invalid token. Please log in again.';
        res.status(401);
    }

    if (err.name === 'TokenExpiredError') {
        response.message = 'Your token has expired. Please log in again.';
        res.status(401);
    }

    res.json(response);
};
