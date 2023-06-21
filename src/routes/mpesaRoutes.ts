import express from 'express';
import {
  MpesaConfirmation,
  MpesaValidation,
} from '../controllers/MpesaPaymentController';

const router = express.Router();
router.post('/validation', MpesaValidation);
router.post('/confirmation', MpesaConfirmation);

export default router;
