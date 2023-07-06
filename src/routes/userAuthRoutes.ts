import express, { Router } from 'express';
import {
  CreateUserAccount,
  DeleteUserAccount,
  GetUserProfile,
  LoginUser,
  UpdateUserDetails,
} from '../controllers/UserControllers';

const router: Router = express.Router();

router.post('/create-user-account', CreateUserAccount);
router.post('/login-user', LoginUser);
router.post('/delete-user-account/:id', DeleteUserAccount);
router.put('/update-user-account/:id', UpdateUserDetails);
router.get('/profile/:id', GetUserProfile);

export default router;
