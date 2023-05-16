import { Request, Response } from "express";
import PasswordHash from "../helpers/PasswordHash";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

//check user
interface CheckUserProps {
  phone: string;
  email: string | undefined;
}
const checkUser = async ({ phone, email }: CheckUserProps) => {
  const user = await prisma.user.findUnique({
    where: {
      phone: phone,
    },
  });
  if (user) {
    return true;
  }
  return false;
};

interface User {
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  salt: string;
  avatar?: string;
  email?: string;
  address?: string;
  gender?: string;
  id: string;
}
export const CreateUserAccount = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, phone, password, email } = req.body as User;
    //check user
    const userExists = await checkUser({ phone, email });
    if (userExists) {
      res.status(400).json({ message: "user already exists" });
      return;
    }
    //hash password and get hashed pass and salt.
    const { passwordHashed, salt } = await PasswordHash(password);
    console.log(salt,passwordHashed);

    //add to db
    await prisma.user.deleteMany();
    const user = await prisma.user.create({
      data: {
        first_name: first_name,
        last_name: last_name,
        password: passwordHashed,
        salt: salt,
        phone: phone,
        
      },
    });
    console.log(user);
    //generate token using user details

    res.status(200).send(user);
  } catch (err: any) {
    res.send(err.message);
  }
};
export const LoginUser = async (req: Request, res: Response) => {
  const { phone, email, password } = req.body as User;
  const user = await prisma.user.findUnique({
    where: {
      phone: phone,
    },
  });
  res.send("login user");
};
export const DeleteUserAccount = async (req: Request, res: Response) => {
  res.send("delete account");
};
export const UpdateUserDetails = async (req: Request, res: Response) => {
  res.send("update user details");
};
export const GetProfile = async (req: Request, res: Response) => {
  res.send("get profile");
};
