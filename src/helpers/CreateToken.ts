import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { UserType } from './enums';

dotenv.config();

const secretKey: string = process.env.TOKEN_SECRET_KEY! || 'supersecretkey';

interface TokenPayload {
  first_name: string;
  last_name: string;
  id: string;
  type: UserType;
}

export const CreateToken = async (
  tokenObject: TokenPayload
): Promise<string> => {
  try {
    const userToken: string = jwt.sign(tokenObject, secretKey, {
      expiresIn: '30d',
    });

    return userToken;
  } catch (err) {
    throw err;
  }
};

export const VerifyToken = async (token: string): Promise<boolean> => {
  try {
    const isValid = await jwt.verify(token, secretKey);
    return !!isValid;
  } catch (err) {
    return false;
  }
};

export interface CustomRequest extends Request {
  payload: JwtPayload;
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization
      ? req.headers?.authorization!.split(' ')[1]
      : '';
    if (!token) {
      return res
        .status(401)
        .json({ message: 'Please pass authentication token' });
    }

    jwt.verify(token, secretKey, function (error, decoded: any) {
      if (error) {
        return res.status(401).json(error);
      }
      if (decoded) {
        (req as CustomRequest).payload = decoded;
      }
    });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
