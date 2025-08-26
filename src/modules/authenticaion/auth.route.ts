import express, { Router } from "express";
import { registerController, loginController,resetPasswordController } from "./auth.controller";
import { registerDto } from "./DTO/Register.dto";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { authActivityMiddleware } from "../../Middleware/activity-logging/activity-logging.middleware";

const router: Router = express.Router();
router.post("/register", validationMiddleware(registerDto), authActivityMiddleware("register"), registerController);
router.post("/login", authActivityMiddleware("login"), loginController);
router.post("/logout", authActivityMiddleware("logout"), (req: any, res: any) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
});
router.post("/reset-password", authActivityMiddleware("password_reset"), resetPasswordController);

export default router;
