import { body, param, query, ValidationChain } from 'express-validator';

// Resource validation
export const uploadValidation: ValidationChain[] = [
    body('batch').notEmpty().withMessage('Batch is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('uploadedBy').optional(),
    body('category').optional().isString(),
];

export const linkValidation: ValidationChain[] = [
    body('batch').notEmpty().withMessage('Batch is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('name').notEmpty().withMessage('Link name is required'),
    body('url').isURL().withMessage('Valid URL is required'),
    body('uploadedBy').optional(),
    body('category').optional().isString(),
];

// Notice validation
export const noticeValidation: ValidationChain[] = [
    body('title').notEmpty().trim().isLength({ min: 3, max: 255 })
        .withMessage('Title must be between 3 and 255 characters'),
    body('content').optional().trim(),
    body('department_id').optional().isString(),
    body('created_by').optional().isString(),
];

export const noticeUpdateValidation: ValidationChain[] = [
    param('id').isInt().withMessage('Invalid notice ID'),
    body('title').notEmpty().trim().isLength({ min: 3, max: 255 })
        .withMessage('Title must be between 3 and 255 characters'),
    body('content').optional().trim(),
    body('is_active').optional().isBoolean(),
];

// User validation
export const userCreateValidation: ValidationChain[] = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'teacher']).withMessage('Invalid role'),
];

export const loginValidation: ValidationChain[] = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

export const userUpdateValidation: ValidationChain[] = [
    param('id').isInt().withMessage('Invalid user ID'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// News validation
export const newsValidation: ValidationChain[] = [
    body('content').notEmpty().trim().isLength({ min: 1, max: 500 })
        .withMessage('News content must be between 1 and 500 characters'),
    body('createdBy').optional().isString(),
];

// Query validation
export const resourceQueryValidation: ValidationChain[] = [
    query('batch').optional().isString(),
    query('subject').optional().isString(),
];

export const noticeQueryValidation: ValidationChain[] = [
    query('department_id').optional().isString(),
];

// ID param validation
export const idParamValidation: ValidationChain[] = [
    param('id').isInt({ min: 1 }).withMessage('Invalid ID'),
];
