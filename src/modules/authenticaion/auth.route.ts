import express, { Router } from "express";
import { registerController } from "./auth.controller";
import { registerDto } from "../DTO/Register.dto";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";

const router: Router = express.Router();
router.post("/register", validationMiddleware(registerDto), registerController);

export default router;
