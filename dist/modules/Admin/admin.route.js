"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("./admin.controller");
const authrization_middleware_1 = require("../../Middleware/authrization/authrization.middleware");
const activity_logging_middleware_1 = require("../../Middleware/activity-logging/activity-logging.middleware");
const router = express_1.default.Router();
router.post("/create-seller", (0, authrization_middleware_1.authorize)(["admin", "super"]), (0, activity_logging_middleware_1.userActivityMiddleware)("created"), admin_controller_1.createSellerController);
exports.default = router;
