import express, { Router } from 'express';
import { SendOTP, verifyOTP } from '../controllers/OTPControllers';

const router: Router = express.Router();

router.post('/sendOTP', SendOTP);
router.post('/verifyOTP', verifyOTP);

export default router;
