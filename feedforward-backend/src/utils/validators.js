// src/utils/validators.js

import { body } from 'express-validator';

/**
 * Register Validation Rules
 */
export const registerValidation = [
    body('name')
        .optional()
        .isString()
        .withMessage('Name must be a string')
        .isLength({ max: 50 })
        .withMessage('Name cannot exceed 50 characters'),
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('avatar')
        .optional()
        .isURL()
        .withMessage('Avatar must be a valid URL'),
    body('bio')
        .optional()
        .isString()
        .withMessage('Bio must be a string')
        .isLength({ max: 160 })
        .withMessage('Bio cannot exceed 160 characters'),
    body('interests')
        .optional()
        .isArray()
        .withMessage('Interests must be an array of strings'),
];

/**
 * Login Validation Rules
 */
export const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .exists()
        .withMessage('Password is required'),
];

/**
 * Post Creation Validation Rules
 */
export const postCreationValidation = [
    body('title')
        .isString()
        .withMessage('Title must be a string')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),
    body('content')
        .isString()
        .withMessage('Content must be a string')
        .isLength({ max: 5000 })
        .withMessage('Content cannot exceed 5000 characters'),
    body('media')
        .optional()
        .isArray()
        .withMessage('Media must be an array of URLs')
        .custom((media) => {
            for (let url of media) {
                if (!/^https?:\/\/.*\.(jpg|jpeg|png|gif|mp4|mov)$/.test(url)) {
                    throw new Error('Invalid media URL format');
                }
            }
            return true;
        }),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array of strings'),
];
