import { plainToInstance } from "class-transformer";
import {
  validateOrReject,
  ValidationError,
  ValidatorOptions,
} from "class-validator";
import { Request, Response, NextFunction } from "express";

export function validationMiddleware<T>(
  type: new () => T
): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const dto: any = plainToInstance(type, req.body);

    // Check if at least one property is present in the request body
    const hasAtLeastOneProperty = Object.keys(req.body).some(
      (key) => req.body[key] !== undefined && req.body[key] !== ""
    );

    if (!hasAtLeastOneProperty) {
      res.status(400).json({
        code: 400,
        status: "Bad Request",
        message: "At least one property must be present in the request body.",
      });
      return;
    }

    // Custom validator options to whitelist only provided properties
    const validatorOptions: ValidatorOptions = {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
    };

    try {
      await validateOrReject(dto, validatorOptions);
      req.body = dto;
      next();
    } catch (errors) {
      if (errors instanceof Array && errors[0] instanceof ValidationError) {
        const validationErrors = errors
          .map((error: ValidationError) =>
            Object.values(error.constraints || {})
          )
          .flat();
        res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: validationErrors[0],
        });
      } else {
        next(errors);
      }
    }
  };
}
