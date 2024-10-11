/**
 * Async Handler
 *
 * Wraps async route handlers and passes errors to the next middleware.
 *
 * @param {Function} fn - The async route handler function.
 * @returns {Function} - A new function that wraps the original function.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
