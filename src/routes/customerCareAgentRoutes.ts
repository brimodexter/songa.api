import express from "express";

import {CustomerCareAgent} from '../controllers/customer_care.controller';

const router=express.Router();
router.post("/create-user-account", CustomerCareAgent)

export default router;