
/**
 * ErrorHandler Middleware
 *
 * This module exports two middleware functions:
 * 1. notFound: Handles 404 errors for undefined routes.
 * 2. errorHandler: Handles all other errors globally.
 */

import mongoose from 'mongoose';

/**
 * notFound Middleware
 *
 * This middleware handles all requests to undefined routes.
 * It creates a new Error object with a 404 status code and passes it to the next middleware.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * errorHandler Middleware
 *
 * This global error handler catches all errors passed through the middleware chain.
 * It formats the error response based on the environment (development or production).
 *
 * @param {Error} err - The error object.
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  // If response status code is 200 (OK), set it to 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Construct the error response
  const response = {
    success: false,
    message: err.message || 'Internal Server Error',
  };

  // Include stack trace only in development mode
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // Handle specific Mongoose errors for more detailed responses
  // Validation Errors
  if (err.name === 'ValidationError') {
    response.message = Object.values(err.errors).map((val) => val.message).join(', ');
    res.status(400);
  }

  // Duplicate Key Errors
  if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyValue);
    response.message = `Duplicate field value entered for ${field}: "${err.keyValue[field]}"`;
    res.status(400);
  }

  // Cast Errors (e.g., invalid ObjectId)
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

  // Send the error response
  res.json(response);
};

module.exports = { notFound, errorHandler };
