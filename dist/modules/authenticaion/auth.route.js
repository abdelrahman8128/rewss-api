"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const Register_dto_1 = require("./DTO/Register.dto");
const validation_middleware_1 = require("../../Middleware/validation/validation.middleware");
const router = express_1.default.Router();
router.post("/register", (0, validation_middleware_1.validationMiddleware)(Register_dto_1.registerDto), auth_controller_1.registerController);
router.post("/login", auth_controller_1.loginController);
exports.default = router;
