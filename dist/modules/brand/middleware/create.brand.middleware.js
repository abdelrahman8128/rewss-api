"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBrandValidationRules = void 0;
const express_validator_1 = require("express-validator");
exports.createBrandValidationRules = [
    (0, express_validator_1.body)('name')
        .isString().withMessage('Brand name must be a string')
        .isLength({ min: 1 }).withMessage('Brand name must be at least 1 characters'),
    (0, express_validator_1.body)('logo')
        .optional()
        .isString().withMessage('Logo must be a string URL or path')
        .custom((value) => {
        return /\.(jpg|jpeg|png|gif|svg)$/i.test(value) ||
            /^(http|https):\/\/.*\.(jpg|jpeg|png|gif|svg)$/i.test(value);
    }).withMessage('Logo must be a valid image file or URL'),
];
