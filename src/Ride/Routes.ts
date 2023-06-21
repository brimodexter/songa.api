import express from 'express';
import { GeoHarsh } from './Controller';

const router = express.Router();
// router.post('', CustomerCareAgent);
router.get('/location', GeoHarsh);

export default router;
