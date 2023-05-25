import express from "express";

import {
    CCAVerification,
    CustomerCareAgent, getAllCCA,
    GetProfileCCA,
    LoginCCA,
    UpdateCCA
} from '../controllers/CustomerCareAgentController';
import {auth} from "../helpers/CreateToken";

const router=express.Router();
router.post("/create-user-account", CustomerCareAgent)
router.get("/create-user-account", auth, getAllCCA)
router.post("/login", LoginCCA)
router.patch("/create-user-account/:id", auth, UpdateCCA)
router.get("/create-user-account/:id",auth, GetProfileCCA)
router.get("/verify/:id/:token", auth, CCAVerification)

export default router;
