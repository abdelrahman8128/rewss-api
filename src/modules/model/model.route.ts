import { createModelController ,listModelController,deleteModelController,updateModelController,listModelByBrandController} from "./model.controller";
import express, { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../Middleware/authrization/authrization.middleware";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { CreateModelDto } from "./Dto/create.model.dto";



const router: Router = express.Router();

router.get("/list-model", listModelController);
router.get("/list-model-by-brand/:brandId", listModelByBrandController);
router.post("/create-model", authorize(["admin"]), validationMiddleware(CreateModelDto), createModelController);
router.patch("/update-model/:id", authorize(["admin"]), updateModelController);
router.delete("/delete-model/:id", authorize(["admin"]), deleteModelController);


export default router;
