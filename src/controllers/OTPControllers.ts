import { Request, Response } from "express";
import { checkUser } from "../helpers/user";
import { CheckUserResult } from "../helpers/user";
import { OTPGenerator } from "../helpers/OTPgenerator";
import { SendOTPCode } from "../helpers/SendOTPCode";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const SendOTP = async (req: Request, res: Response) => {
  try {
    const { phone, id } = req.body;
    console.log(phone, typeof phone, typeof id, id);
    //check user from ID
    const userExists = (await checkUser(
      { id },
      { id: true }
    )) as CheckUserResult;
    console.log(userExists);
    if (!userExists.userPresent) {
      res
        .status(401)
        .json({ message: "User with that phone number does not exist" });
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
    console.log(hasCode, typeof hasCode?.phone, typeof hasCode?.id, "has code");

    //generate OTP Code and store it to the database
    const otp: string = await OTPGenerator();
    console.log(otp);
    console.log("adding to db.....");

    await prisma.userOTP
      .create({
        data: {
          code: otp,
          userId: userExists.user!.id,
          phone: phone,
        },
      })
      .catch((err) => {
        let errmessage;
        if (
          err.message.includes(
            "Unique constraint failed on the fields: (`userId`)"
          )
        ) {
          errmessage = "user already has a code";
        }
        err.message = "couldn't send code";
        res.status(400).json({ message: errmessage });
        return;
      });
    console.log("added to db");

    //send the OTP to the number
    // await SendOTPCode(otp);
    // res
    //   .status(200)
    //   .json({ message: `OTP sent to ${phone} the code is ${otp}` });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
export const verifyOTP = async (req: Request, res: Response) => {
  res.send("She's thirsty");
  //get code , id, and phone number
  //check user
  //compare codes
};
