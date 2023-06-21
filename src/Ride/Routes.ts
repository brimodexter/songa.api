import express from 'express';

import {
  CustomerCareAgent,
  getAllCCA,
} from '../controllers/CustomerCareAgentController';
import { auth } from '../helpers/CreateToken';

const router = express.Router();
router.post('', CustomerCareAgent);
router.get('', auth, getAllCCA);

export default router;
