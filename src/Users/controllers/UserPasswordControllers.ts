import { Request, Response } from 'express';
import { checkUser } from '../../helpers/user';
import { VerifyToken } from '../../helpers/CreateToken';
import PasswordHash, { DecryptPassword } from '../../helpers/PasswordHash';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface passwordChangeParams {
  id: string;
  oldPassword: string;
  newPassword: string;
  token?: string;
}
export const UserPasswordChange = async (req: Request, res: Response) => {
  const { id, oldPassword, newPassword } = req.body as passwordChangeParams;
  //check user
  const userExists = await checkUser(
    { id },
    {
      first_name: true,
      last_name: true,
      id: true,
      sessionToken: true,
      password: true,
    }
  );
  if (!userExists?.userPresent) {
    res.json({ message: 'User does not exist.' });
    return;
  }
  //check auth token
  const token = userExists.user?.sessionToken as string;
  const isTokenValid = await VerifyToken(token);
  
  if (!isTokenValid) {
    res.status(401).json({
      message:
        'Invalid session token. Please logout and login again then try changing your password',
    });
    return;
  }

  //check whether old password = password in DB
  const passwordHashed: string = userExists.user!.password;
  let password;
  password = oldPassword;
  const isPasswordsMatching = await DecryptPassword({
    password,
    passwordHashed,
  });
  
  if (!isPasswordsMatching) {
    res.json({
      message:
        'Wrong Old password provided. Please provide the right old/current password. Or try resetting your password',
    });
    return;
  }
  //check whether new password is equal to old password
  password = newPassword;
  const isSamePassword = await DecryptPassword({ password, passwordHashed });
 
  if (isSamePassword) {
    res
      .status(400)
      .json({ message: 'Old and New passwords match. Cannot update password' });
  }

  //replace the password in DB
  const newPasswordHashed = await PasswordHash(newPassword);
  try {
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        password: newPasswordHashed.passwordHashed,
        salt: newPasswordHashed.salt,
      },
    });

    res.status(400).json({ message: 'Password updated successfully.' });
  } catch (err) {
    res.status(400).json({ message: 'Something went wrong. Please try again' });
  }
};

export const UserPasswordReset = async (req: Request, res: Response) => {
    const { id, oldPassword, newPassword } = req.body as passwordChangeParams;
    //check user
    const userExists = await checkUser(
      { id },
      {
        first_name: true,
        last_name: true,
        id: true,
        sessionToken: true,
        password: true,
      }
    );
    if (!userExists?.userPresent) {
      res.json({ message: 'User does not exist.' });
      return;
    }
    //check auth token
    const token = userExists.user?.sessionToken as string;
    const isTokenValid = await VerifyToken(token);
    
    if (!isTokenValid) {
      res.status(401).json({
        message:
          'Invalid session token. Please logout and login again then try changing your password',
      });
      return;
    }
  
  //check user
  //send OTP
  //verify OTP
  //provide new password and replace it in DB.
};
