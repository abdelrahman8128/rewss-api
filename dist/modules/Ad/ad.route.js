"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ad_controller_1 = require("./ad.controller");
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = require("../../Middleware/validation/validation.middleware");
const create_ad_dto_1 = require("./DTO/create.ad.dto");
const authrization_middleware_1 = require("../../Middleware/authrization/authrization.middleware");
const activity_logging_middleware_1 = require("../../Middleware/activity-logging/activity-logging.middleware");
const router = express_1.default.Router();
router.post("/create-ad", (0, authrization_middleware_1.authorize)(["admin"]), (0, validation_middleware_1.validationMiddleware)(create_ad_dto_1.CreateAdDto), (0, activity_logging_middleware_1.adActivityMiddleware)("created"), ad_controller_1.createAdController);
router.patch("/update-ad/:id", (0, authrization_middleware_1.authorize)(["admin", "seller"]), (0, validation_middleware_1.validationMiddleware)(create_ad_dto_1.CreateAdDto, true), (0, activity_logging_middleware_1.adActivityMiddleware)("updated"), ad_controller_1.updateAdController);
router.get("/:id", authrization_middleware_1.authMiddleware, (0, activity_logging_middleware_1.adActivityMiddleware)("viewed"), (req, res) => {
    res.status(501).json({ success: false, message: "Get ad endpoint not implemented yet" });
});
router.get("/", authrization_middleware_1.authMiddleware, (0, activity_logging_middleware_1.adActivityMiddleware)("list_viewed"), (req, res) => {
    res.status(501).json({ success: false, message: "List ads endpoint not implemented yet" });
});
exports.default = router;
