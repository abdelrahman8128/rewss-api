import { plainToInstance } from "class-transformer";
import { validateOrReject, ValidationError, ValidatorOptions } from "class-validator";
import { Request, Response, NextFunction } from "express";
import multer from "multer";

const upload = multer(); // Memory storage for parsing form-data

export function validationMiddleware<T extends object>(type: new () => T) {
  const validatorOptions: ValidatorOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
    skipMissingProperties: false,
  };

  const runValidation = async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(type, req.body, { enableImplicitConversion: true }) as T;

    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({
        code: 400,
        status: "Bad Request",
        message: "Request body cannot be empty.",
      });
      return;
    }

    try {
      await validateOrReject(dto as object, validatorOptions);
      req.body = dto;
      next();
    } catch (err) {
      if (Array.isArray(err) && err[0] instanceof ValidationError) {
        const messages = err.map((e: ValidationError) => Object.values(e.constraints ?? {})).flat();
        res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: messages[0] ?? "Validation failed",
        });
      } else {
        next(err);
      }
    }
  };

  return (req: Request, res: Response, next: NextFunction) => {
    if (req.is("multipart/form-data")) {

      upload.any()(req, res, (err) => {
        if (err) return next(err);
        runValidation(req, res, next);
      });
      
    } else {
      runValidation(req, res, next);
    }
  };
}
