"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ban_controller_1 = require("./ban.controller");
const authrization_middleware_1 = require("../../Middleware/authrization/authrization.middleware");
const activity_logging_middleware_1 = require("../../Middleware/activity-logging/activity-logging.middleware");
const validation_middleware_1 = require("../../Middleware/validation/validation.middleware");
const ban_dto_1 = require("./DTO/ban.dto");
const router = express_1.default.Router();
router.post("/ban-user", (0, authrization_middleware_1.authorize)(["admin", "super"]), (0, validation_middleware_1.validationMiddleware)(ban_dto_1.BanUserDto), (0, activity_logging_middleware_1.userActivityMiddleware)("created"), ban_controller_1.banUserController);
router.post("/unban-user", (0, authrization_middleware_1.authorize)(["admin", "super"]), (0, validation_middleware_1.validationMiddleware)(ban_dto_1.UnbanUserDto), (0, activity_logging_middleware_1.userActivityMiddleware)("updated"), ban_controller_1.unbanUserController);
router.get("/ban-history/:userId", (0, authrization_middleware_1.authorize)(["admin", "super"]), (0, activity_logging_middleware_1.userActivityMiddleware)("viewed"), ban_controller_1.getBanHistoryController);
router.get("/active-bans", (0, authrization_middleware_1.authorize)(["admin", "super"]), (0, activity_logging_middleware_1.userActivityMiddleware)("viewed"), ban_controller_1.getActiveBansController);
exports.default = router;
