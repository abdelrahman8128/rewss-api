import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';


export const createBrandValidationRules = [
    body('name')
        .isString().withMessage('Brand name must be a string')
        .isLength({ min: 1 }).withMessage('Brand name must be at least 1 characters'),
   
    body('logo')
        .optional()
        .isString().withMessage('Logo must be a string URL or path')
        .custom((value) => {

            return /\.(jpg|jpeg|png|gif|svg)$/i.test(value) || 
                  /^(http|https):\/\/.*\.(jpg|jpeg|png|gif|svg)$/i.test(value);
        }).withMessage('Logo must be a valid image file or URL'),
   
];
