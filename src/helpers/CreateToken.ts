import { User } from "@prisma/client";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

const secretKey: string = process.env.TOKEN_SECRET_KEY! || "supersecretkey";

export const CreateToken = async (userObject: User): Promise<string> => {
  try {
    const userToken: string = await jwt.sign(userObject, secretKey, {
      expiresIn: "30d",
    });
    console.log(userToken);

    return userToken;
  } catch (err) {
    //console.log(err.message);
    throw err;
  }
};

export const VerifyToken = async (token: string): Promise<boolean> => {
  try {
    const isValid = await jwt.verify(token, secretKey);
    console.log(isValid);
    if (isValid) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};
