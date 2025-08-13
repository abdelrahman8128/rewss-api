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
function validationMiddleware(type, isUpdate = false) {
    const validatorOptions = {
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: isUpdate
    };
    const stripIsDefinedErrors = (errors) => {
        const prune = (errs) => {
            return errs
                .map((e) => {
                const nextChildren = e.children && e.children.length ? prune(e.children) : [];
                const nextConstraints = e.constraints
                    ? Object.fromEntries(Object.entries(e.constraints).filter(([k]) => k !== "isDefined"))
                    : undefined;
                const hasConstraints = nextConstraints && Object.keys(nextConstraints).length > 0;
                const hasChildren = nextChildren.length > 0;
                return {
                    ...e,
                    constraints: hasConstraints ? nextConstraints : undefined,
                    children: nextChildren
                };
            })
                .filter((e) => {
                const hasConstraints = e.constraints && Object.keys(e.constraints).length > 0;
                const hasChildren = e.children && e.children.length > 0;
                return hasConstraints || hasChildren;
            });
        };
        return prune(errors);
    };
    const runValidation = async (req, res, next) => {
        const plainBody = req.body && typeof req.body === "object" ? req.body : {};
        const dto = (0, class_transformer_1.plainToInstance)(type, plainBody, { enableImplicitConversion: true });
        if (dto && typeof dto === "object") {
            Object.keys(dto).forEach((key) => {
                const value = dto[key];
                if (value === undefined || (isUpdate && value === null)) {
                    delete dto[key];
                }
            });
        }
        const isMultipart = req.is("multipart/form-data");
        const files = req.files;
        const hasFiles = Array.isArray(files) && files.length > 0;
        const bodyIsEmpty = !req.body || Object.keys(req.body).length === 0;
        if (isMultipart && hasFiles && bodyIsEmpty) {
            req.body = dto;
            return next();
        }
        try {
            await (0, class_validator_1.validateOrReject)(dto, validatorOptions);
            req.body = dto;
            next();
        }
        catch (err) {
            if (Array.isArray(err) && err[0] instanceof class_validator_1.ValidationError) {
                const rawErrors = err;
                const finalErrors = isUpdate ? stripIsDefinedErrors(rawErrors) : rawErrors;
                if (isUpdate && finalErrors.length === 0) {
                    req.body = dto;
                    return next();
                }
                const messages = finalErrors.map((e) => Object.values(e.constraints ?? {})).flat();
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
