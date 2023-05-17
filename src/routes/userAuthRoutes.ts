import express from 'express';
import { CreateUserAccount, DeleteUserAccount, GetProfile, LoginUser, UpdateUserDetails } from '../controllers/UserControllers';
const router=express.Router();

router.post("/create-user-account", CreateUserAccount)
router.post("/login-user", LoginUser)
router.post("/delete-user/:id", DeleteUserAccount)
router.post("/delete-user/:id", UpdateUserDetails)
router.get("/profile/:id",GetProfile)

export default router;