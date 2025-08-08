import { requestOtpController, verifyOtpController } from "./otp.controller";
import express, { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../Middleware/authrization/authrization.middleware";

const router: Router = express.Router();
router.post("/request-otp", requestOtpController);
router.post("/verify-otp", verifyOtpController);

export default router;
