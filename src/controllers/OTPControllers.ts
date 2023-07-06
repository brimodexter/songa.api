import { Request, Response } from 'express';
import { checkUser } from '../helpers/user';
import { CheckUserResult } from '../helpers/user';
import { OTPGenerator } from '../helpers/OTPgenerator';
import { SendOTPCode } from '../helpers/SendOTPCode';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const SendOTP = async (req: Request, res: Response) => {
  try {
    const { phone, id } = req.body;
    //check user from ID
    const userExists = (await checkUser(
      { id },
      { id: true }
    )) as CheckUserResult;
    if (!userExists.userPresent) {
      res
        .status(401)
        .json({ message: 'User with that phone number does not exist' });
      return;
    }
    //check whether user has another code
    const hasCode = await prisma.userOTP.findUnique({
      where: {
        phone: phone,
      },
      select: {
        id: true,
        phone: true,
        code: true,
      },
    });

    //generate OTP Code and store it to the database
    const otp: string = await OTPGenerator();

    if (hasCode) {
      await prisma.userOTP
        .update({
          where: {
            phone: phone,
          },
          data: {
            code: otp,
          },
        })
        .catch(err => console.log('error updating record'));
    } else {
      await prisma.userOTP
        .create({
          data: {
            code: otp,
            userId: userExists.user!.id,
            phone: phone,
          },
        })
        .catch(err => {
          let errmessage;
          if (
            err.message.includes(
              'Unique constraint failed on the fields: (`userId`)'
            )
          ) {
            errmessage = 'user already has a code';
          }
          err.message = "couldn't send code";
          res.status(400).json({ message: errmessage });
          return;
        });
    }

    //send the OTP to the number
    await SendOTPCode({ otpCode: otp, number: phone });
    res
      .status(200)
      .json({ message: `OTP sent to ${phone} the code is ${otp}` });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};
export const verifyOTP = async (req: Request, res: Response) => {
  const { phone, userId: id, code } = req.body;
  console.log(phone, id, code);

  //check user
  const userExists = await checkUser({ id });
  if (!userExists?.userPresent) {
    res.status(401).json({ message: "User with the given ID doesn't exist" });
    return;
  }
  //check whether the phone number has a code attached to it.
  const hasCode = await prisma.userOTP.findUnique({
    where: {
      phone: phone,
    },
    select: {
      userId: true,
      code: true,
      phone: true,
    },
  });
  if (id === hasCode!.userId) {
    if (code === hasCode?.code) {
      res.status(200).json({ message: 'OTP code has been verified.' });
    } else {
      res.status(400).json({ message: 'invalid code provided' });
    }
  } else {
    res
      .status(400)
      .json({ message: 'User Id does not match the one on the phone number' });
  }

  //get code , id, and phone number
  //check user
  //compare codes
};
