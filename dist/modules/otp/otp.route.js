"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const otp_controller_1 = require("./otp.controller");
const express_1 = __importDefault(require("express"));
const authrization_middleware_1 = require("../../Middleware/authrization/authrization.middleware");
const router = express_1.default.Router();
router.post("/request-otp", authrization_middleware_1.authMiddleware, otp_controller_1.requestOtpController);
router.post("/verify-otp", authrization_middleware_1.authMiddleware, otp_controller_1.verifyOtpController);
exports.default = router;
