"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = validationMiddleware;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)();
function validationMiddleware(type) {
    const validatorOptions = {
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
    };
    const runValidation = async (req, res, next) => {
        const dto = (0, class_transformer_1.plainToInstance)(type, req.body, { enableImplicitConversion: true });
        if (!req.body || Object.keys(req.body).length === 0) {
            res.status(400).json({
                code: 400,
                status: "Bad Request",
                message: "Request body cannot be empty.",
            });
            return;
        }
        try {
            await (0, class_validator_1.validateOrReject)(dto, validatorOptions);
            req.body = dto;
            next();
        }
        catch (err) {
            if (Array.isArray(err) && err[0] instanceof class_validator_1.ValidationError) {
                const messages = err.map((e) => Object.values(e.constraints ?? {})).flat();
                res.status(400).json({
                    code: 400,
                    status: "Bad Request",
                    message: messages[0] ?? "Validation failed",
                });
            }
            else {
                next(err);
            }
        }
    };
    return (req, res, next) => {
        if (req.is("multipart/form-data")) {
            upload.any()(req, res, (err) => {
                if (err)
                    return next(err);
                runValidation(req, res, next);
            });
        }
        else {
            runValidation(req, res, next);
        }
    };
}
