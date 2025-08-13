"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const category_controller_1 = require("./category.controller");
const express_1 = require("express");
const validation_middleware_1 = require("../../Middleware/validation/validation.middleware");
const create_category_dto_1 = require("./Dto/create.category.dto");
const router = (0, express_1.Router)();
router.post("/create-category", (0, validation_middleware_1.validationMiddleware)(create_category_dto_1.CreateCategoryDto), category_controller_1.createCategory);
exports.default = router;
