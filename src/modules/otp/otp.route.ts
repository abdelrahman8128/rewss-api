import { requestOtpController } from './controllers/requestOtp.controller';
import express, { Router } from "express";

const router: Router = express.Router();
router.post("/request-otp", requestOtpController);

export default router;
