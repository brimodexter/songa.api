import express from "express";

import {CustomerCareAgent, CCAVerification} from '../controllers/customer_care.controller';

const router = express.Router();
router.post("/create-user-account", CustomerCareAgent)
router.get("/verify/:id/:token", CCAVerification)

export default router;
