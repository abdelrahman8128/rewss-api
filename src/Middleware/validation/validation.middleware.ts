import { plainToInstance } from "class-transformer";
import { validateOrReject, ValidationError, ValidatorOptions } from "class-validator";
import { Request, Response, NextFunction } from "express";
import multer from "multer";

const upload = multer(); // Memory storage for parsing form-data

export function validationMiddleware<T extends object>(type: new () => T, isUpdate = false) {
  const validatorOptions: ValidatorOptions = {
    whitelist: true,
    forbidNonWhitelisted: true,
    // Only skip missing properties for updates
    skipMissingProperties: isUpdate
  };

  // Remove "isDefined" errors on update to allow missing fields
  const stripIsDefinedErrors = (errors: ValidationError[]): ValidationError[] => {
    const prune = (errs: ValidationError[]): ValidationError[] => {
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
          } as ValidationError;
        })
        .filter((e) => {
          const hasConstraints = e.constraints && Object.keys(e.constraints).length > 0;
          const hasChildren = e.children && e.children.length > 0;
          return hasConstraints || hasChildren;
        });
    };
    return prune(errors);
  };

  const runValidation = async (req: Request, res: Response, next: NextFunction) => {
    const plainBody = req.body && typeof req.body === "object" ? req.body : {};
    const dto = plainToInstance(type, plainBody, { enableImplicitConversion: true }) as T;

    // Remove undefined properties and, on updates, null values before validation
    if (dto && typeof dto === "object") {
      Object.keys(dto as any).forEach((key) => {
        const value = (dto as any)[key];
        if (value === undefined || (isUpdate && value === null)) {
          delete (dto as any)[key];
        }
      });
    }

    // If multipart with files and no body fields, skip body validation
    const isMultipart = req.is("multipart/form-data");
    const files = (req as any).files;
    const hasFiles = Array.isArray(files) && files.length > 0;
    const bodyIsEmpty = !req.body || Object.keys(req.body).length === 0;
    if (isMultipart && hasFiles && bodyIsEmpty) {
      req.body = dto;
      return next();
    }

    try {
      await validateOrReject(dto as object, validatorOptions);
      req.body = dto;
      next();
    } catch (err) {
      if (Array.isArray(err) && err[0] instanceof ValidationError) {
        const rawErrors = err as ValidationError[];
        const finalErrors = isUpdate ? stripIsDefinedErrors(rawErrors) : rawErrors;

        if (isUpdate && finalErrors.length === 0) {
          req.body = dto;
          return next();
        }

        const messages = finalErrors.map((e: ValidationError) => Object.values(e.constraints ?? {})).flat();
        res.status(400).json({
          code: 400,
          status: "Bad Request",
          message: messages[0] ?? "Validation failed",
        });
      } else {
        next(err as any);
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
