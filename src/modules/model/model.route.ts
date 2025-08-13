import { createModel ,listModel,deleteModel,updateModel} from "./model.controller";
import express, { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../Middleware/authrization/authrization.middleware";
import { validationMiddleware } from "../../Middleware/validation/validation.middleware";
import { CreateModelDto } from "./Dto/create.model.dto";



const router: Router = express.Router();

router.get("/list-model", listModel);
router.post("/create-model", authorize(["admin"]), validationMiddleware(CreateModelDto), createModel);
 router.patch("/update-model/:id", authorize(["admin"]),  updateModel);
router.delete("/delete-model/:id", authorize(["admin"]), deleteModel);

export default router;
