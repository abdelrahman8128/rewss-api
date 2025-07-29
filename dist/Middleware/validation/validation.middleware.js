"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationMiddleware = validationMiddleware;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
function validationMiddleware(type) {
    return async (req, res, next) => {
        const dto = (0, class_transformer_1.plainToInstance)(type, req.body);
        const hasAtLeastOneProperty = Object.keys(req.body).some((key) => req.body[key] !== undefined && req.body[key] !== "");
        if (!hasAtLeastOneProperty) {
            res.status(400).json({
                code: 400,
                status: "Bad Request",
                message: "At least one property must be present in the request body.",
            });
            return;
        }
        const validatorOptions = {
            whitelist: true,
            forbidNonWhitelisted: true,
            skipMissingProperties: false,
        };
        try {
            await (0, class_validator_1.validateOrReject)(dto, validatorOptions);
            req.body = dto;
            next();
        }
        catch (errors) {
            if (errors instanceof Array && errors[0] instanceof class_validator_1.ValidationError) {
                const validationErrors = errors
                    .map((error) => Object.values(error.constraints || {}))
                    .flat();
                res.status(400).json({
                    code: 400,
                    status: "Bad Request",
                    message: validationErrors[0],
                });
            }
            else {
                next(errors);
            }
        }
    };
}
