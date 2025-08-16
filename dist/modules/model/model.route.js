"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const model_controller_1 = require("./model.controller");
const express_1 = __importDefault(require("express"));
const authrization_middleware_1 = require("../../Middleware/authrization/authrization.middleware");
const validation_middleware_1 = require("../../Middleware/validation/validation.middleware");
const create_model_dto_1 = require("./Dto/create.model.dto");
const router = express_1.default.Router();
router.get("/list-model", model_controller_1.listModelController);
router.get("/list-model-by-brand/:brandId", model_controller_1.listModelByBrandController);
router.post("/create-model", (0, authrization_middleware_1.authorize)(["admin"]), (0, validation_middleware_1.validationMiddleware)(create_model_dto_1.CreateModelDto), model_controller_1.createModelController);
router.patch("/update-model/:id", (0, authrization_middleware_1.authorize)(["admin"]), model_controller_1.updateModelController);
router.delete("/delete-model/:id", (0, authrization_middleware_1.authorize)(["admin"]), model_controller_1.deleteModelController);
exports.default = router;
