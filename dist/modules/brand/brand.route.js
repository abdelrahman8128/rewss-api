"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const brand_controller_1 = require("./brand.controller");
const express_1 = __importDefault(require("express"));
const validation_middleware_1 = require("../../Middleware/validation/validation.middleware");
const create_brand_1 = require("./Dto/create.brand");
const router = express_1.default.Router();
router.post("/create-brand", (0, validation_middleware_1.validationMiddleware)(create_brand_1.CreateBrandDto), brand_controller_1.createBrand);
router.get("/list-brands", brand_controller_1.listBrand);
router.patch("/update-brand/:id", (0, validation_middleware_1.validationMiddleware)(create_brand_1.CreateBrandDto), brand_controller_1.updateBrand);
exports.default = router;
