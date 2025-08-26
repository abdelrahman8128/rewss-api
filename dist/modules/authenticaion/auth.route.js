"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const Register_dto_1 = require("./DTO/Register.dto");
const validation_middleware_1 = require("../../Middleware/validation/validation.middleware");
const activity_logging_middleware_1 = require("../../Middleware/activity-logging/activity-logging.middleware");
const router = express_1.default.Router();
router.post("/register", (0, validation_middleware_1.validationMiddleware)(Register_dto_1.registerDto), (0, activity_logging_middleware_1.authActivityMiddleware)("register"), auth_controller_1.registerController);
router.post("/login", (0, activity_logging_middleware_1.authActivityMiddleware)("login"), auth_controller_1.loginController);
router.post("/logout", (0, activity_logging_middleware_1.authActivityMiddleware)("logout"), (req, res) => {
    res.status(200).json({ success: true, message: "Logged out successfully" });
});
router.post("/reset-password", (0, activity_logging_middleware_1.authActivityMiddleware)("password_reset"), auth_controller_1.resetPasswordController);
exports.default = router;
