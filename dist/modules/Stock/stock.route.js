"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stock_controller_1 = require("./stock.controller");
const validation_middleware_1 = require("../../Middleware/validation/validation.middleware");
const stock_dto_1 = require("./DTO/stock.dto");
const authrization_middleware_1 = require("../../Middleware/authrization/authrization.middleware");
const activity_logging_middleware_1 = require("../../Middleware/activity-logging/activity-logging.middleware");
const router = (0, express_1.Router)();
router.get("/ad/:adId", (0, authrization_middleware_1.authorize)(["admin", "seller"]), (0, activity_logging_middleware_1.stockActivityMiddleware)("viewed"), stock_controller_1.getStockController);
router.put("/ad/:adId", (0, authrization_middleware_1.authorize)(["admin", "seller"]), (0, validation_middleware_1.validationMiddleware)(stock_dto_1.StockDto, true), (0, activity_logging_middleware_1.stockActivityMiddleware)("updated"), stock_controller_1.updateStockController);
router.post("/ad/:adId/reserve", (0, authrization_middleware_1.authorize)(["admin", "seller", "buyer"]), (0, activity_logging_middleware_1.stockActivityMiddleware)("reserved"), (req, res) => {
    res.status(501).json({ success: false, message: "Reserve stock endpoint not implemented yet" });
});
router.post("/ad/:adId/buy", (0, authrization_middleware_1.authorize)(["admin", "seller", "buyer"]), (0, activity_logging_middleware_1.stockActivityMiddleware)("bought"), (req, res) => {
    res.status(501).json({ success: false, message: "Buy stock endpoint not implemented yet" });
});
router.get("/ad/:adId/activity", (0, authrization_middleware_1.authorize)(["admin", "seller"]), (0, activity_logging_middleware_1.stockActivityMiddleware)("activity_viewed"), (req, res) => {
    res.status(501).json({ success: false, message: "Stock activity endpoint not implemented yet" });
});
exports.default = router;
