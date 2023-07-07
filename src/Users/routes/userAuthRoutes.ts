import express, { Router } from 'express';
import {
  CreateUserAccount,
  DeleteUserAccount,
  GetUserProfile,
  LoginUser,
  UpdateUserDetails,
} from '../controllers/UserControllers';
import { UserPasswordChange } from '../controllers/UserPasswordControllers';

const router: Router = express.Router();

router.post('/create-user-account', CreateUserAccount);
router.post('/login-user', LoginUser);
router.delete('/delete-user-account/:id', DeleteUserAccount);
router.put('/update-user-account/:id', UpdateUserDetails);
router.put('/change-password/:id', UserPasswordChange);
router.get('/profile/:id', GetUserProfile);

export default router;
