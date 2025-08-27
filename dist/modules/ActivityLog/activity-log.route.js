"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activity_log_controller_1 = require("./activity-log.controller");
const authrization_middleware_1 = require("../../Middleware/authrization/authrization.middleware");
const router = (0, express_1.Router)();
router.get("/history", authrization_middleware_1.authMiddleware, activity_log_controller_1.getUserActivityHistoryController);
router.get("/history/:userId", (0, authrization_middleware_1.authorize)(["admin"]), activity_log_controller_1.getUserActivityHistoryController);
exports.default = router;
