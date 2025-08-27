"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const brand_controller_1 = require("./brand.controller");
const express_1 = __importDefault(require("express"));
const authrization_middleware_1 = require("../../Middleware/authrization/authrization.middleware");
const validation_middleware_1 = require("../../Middleware/validation/validation.middleware");
const create_brand_dto_1 = require("./Dto/create.brand.dto");
const activity_logging_middleware_1 = require("../../Middleware/activity-logging/activity-logging.middleware");
const router = express_1.default.Router();
router.get("/list-brands", (0, activity_logging_middleware_1.genericActivityMiddleware)("other", "list_viewed"), brand_controller_1.listBrand);
router.post("/create-brand", (0, authrization_middleware_1.authorize)(["admin"]), (0, validation_middleware_1.validationMiddleware)(create_brand_dto_1.CreateBrandDto), (0, activity_logging_middleware_1.genericActivityMiddleware)("other", "created"), brand_controller_1.createBrand);
router.patch("/update-brand/:id", (0, authrization_middleware_1.authorize)(["admin"]), (0, validation_middleware_1.validationMiddleware)(create_brand_dto_1.CreateBrandDto, true), (0, activity_logging_middleware_1.genericActivityMiddleware)("other", "updated"), brand_controller_1.updateBrand);
router.delete("/delete-brand/:id", (0, authrization_middleware_1.authorize)(["admin"]), (0, activity_logging_middleware_1.genericActivityMiddleware)("other", "deleted"), brand_controller_1.deleteBrand);
exports.default = router;
