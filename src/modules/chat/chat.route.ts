import express, { Router } from "express";
import { authMiddleware, authorize } from "../../Middleware/authrization/authrization.middleware";
import { getMyChatsController } from "./chat.controller";

const router: Router = express.Router();

router.get(
  "/my",
  authMiddleware,
  getMyChatsController
);

export default router;
