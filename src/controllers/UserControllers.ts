import { Request, Response } from "express";
import PasswordHash, { DecryptPassword } from "../helpers/PasswordHash";
import { PrismaClient, Prisma, User } from "@prisma/client";
const prisma = new PrismaClient();

//check user
interface CheckUserProps {
  phone?: string;
  email?: string | null;
  id?: string;
}
type CheckUserResult = {
  userPresent: boolean;
  user: User | null;
};
//this function takes in a unique identifier and a selector of all the fields you want from the user object
const checkUser = async (
  { phone, email, id }: CheckUserProps,
  select?: Prisma.UserSelect
): Promise<CheckUserResult | undefined> => {
  if (id) {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: select,
    });
    if (user) {
      return { userPresent: true, user: user } as CheckUserResult;
    }
    return { userPresent: false, user: null } as CheckUserResult;
  }
  if (phone) {
    const user = await prisma.user.findUnique({
      where: {
        phone: phone,
      },
      select: select,
    });
    if (user) {
      return { userPresent: true, user: user } as CheckUserResult;
    }
    return { userPresent: false, user: null } as CheckUserResult;
  }
  if (email) {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: select,
    });
    if (user) {
      return { userPresent: true, user: user } as CheckUserResult;
    }
    return { userPresent: false, user: null } as CheckUserResult;
  }
  return undefined;
};

// interface User {
//   first_name: string;
//   last_name: string;
//   phone: string;
//   password: string;
//   salt: string;
//   avatar?: string;
//   email?: string;
//   address?: string;
//   gender?: string;
//   id: string;
// }
export const CreateUserAccount = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, phone, password, email } = req.body as User;
    //check user
    const userExists = await checkUser({ phone, email }) as CheckUserResult;
    console.log(userExists.userPresent);
    if (userExists.userPresent) {
      res.status(400).json({ message: "user already exists" });
      return;
    }

    console.log("continuing.......");

    //hash password and get hashed pass and salt.
    const { passwordHashed, salt } = await PasswordHash(password);
    console.log(salt, passwordHashed);

    //add to db
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
  //check user
  const checkUserResult = await checkUser(
    { phone },
    {
      first_name: true,
      last_name: true,
      phone: true,
      email: true,
      avatar: true,
      address: true,
      id: true,
      password: true,
    }
  );
  console.log(checkUserResult);

  if (checkUserResult) {
    const { user, userPresent } = checkUserResult;
    if (!userPresent) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    //console.log(user);

    if (phone !== user?.phone) {
      res.status(401).json({ message: "unauthorized" });
      return;
    } else {
      const passwordHashed = user.password;
      const passwordMatch = await DecryptPassword({ password, passwordHashed });

      if (!passwordMatch) {
        res.status(401).json({ message: "unauthorized" });
      } else {
        const { password, ...cleanUser } = user;
        res.status(200).json({ message: "cleared", user: cleanUser });
      }
    }
  }
};
export const DeleteUserAccount = async (req: Request, res: Response) => {
  try {
    res.send("delete account");
  } catch (err) {}
};
export const UpdateUserDetails = async (req: Request, res: Response) => {
  try {
    res.send("update user details");
  } catch (err) {}
};
export const GetProfile = async (req: Request, res: Response) => {
  const { id } = req.body;
  try {
    const checkUserResult = await checkUser(
      { id: id },
      {
        first_name: true,
        last_name: true,
        avatar: true,
        address: true,
        email: true,
        gender: true,
        phone: true,
      }
    );
    if (checkUserResult) {
      const { user } = checkUserResult;
      res.status(200).json(user);
    }
  } catch (err) {}
};
