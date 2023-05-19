import express from 'express';
import { CreateRiderAccount, DeleteRiderAccount, GetRiderProfile, LoginRider, UpdateRiderAccount } from '../controllers/RiderControllers';
const router=express.Router();

router.post("/create-rider-account", CreateRiderAccount)
router.post("/login-rider", LoginRider)
router.post("/delete-rider/:id", DeleteRiderAccount)
router.put("/update-rider-details/:id", UpdateRiderAccount)
router.get("/profile/:id",GetRiderProfile)

export default router;