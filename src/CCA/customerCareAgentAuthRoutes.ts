import express from 'express';

import {
  CCAVerification,
  CustomerCareAgent,
  getAllCCA,
  GetProfileCCA,
  LoginCCA,
  requestPasswordResetRequest,
  requestPasswordResetResponse,
  UpdateCCA,
} from './CustomerCareAgentController';
import { auth } from '../helpers/CreateToken';

const router = express.Router();
router.post('', CustomerCareAgent);
router.get('', auth, getAllCCA);
router.post('/login', LoginCCA);
router.patch('/:id', auth, UpdateCCA);
router.get('/:id', auth, GetProfileCCA);
router.get('/verify/:id/:token', CCAVerification);
router.post('/password-reset', requestPasswordResetRequest);
router.post('/password-reset/:id/:token', requestPasswordResetResponse);

export default router;
