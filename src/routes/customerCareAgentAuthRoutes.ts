import express from "express";

import {
    CCAVerification,
    CustomerCareAgent,
    GetProfileCCA,
    LoginCCA,
    UpdateCCA
} from '../controllers/CustomerCareAgentController';

const router=express.Router();
router.post("/create-user-account", CustomerCareAgent)
// router.get("/create-user-account", CustomerCareAgent)
router.post("/login", LoginCCA)
router.patch("/create-user-account/:id", UpdateCCA)
router.get("/create-user-account/:id", GetProfileCCA)
router.get("/verify/:id/:token", CCAVerification)

export default router;
