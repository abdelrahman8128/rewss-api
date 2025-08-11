"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const brand_controller_1 = require("./brand.controller");
const express_1 = __importDefault(require("express"));
const create_brand_middleware_1 = require("./middleware/create.brand.middleware");
const router = express_1.default.Router();
router.post("/create-brand", create_brand_middleware_1.createBrandValidationRules, brand_controller_1.createBrand);
exports.default = router;
