import { Request, Response } from "express";
import PasswordHash, { DecryptPassword } from "../helpers/PasswordHash";
import { PrismaClient, Prisma, User } from "@prisma/client";
import { CreateToken, VerifyToken } from "../helpers/CreateToken";
import { checkUser } from "../helpers/user";
import { CheckUserResult } from "../helpers/user";

const prisma = new PrismaClient();

//check user

//this function takes in a unique identifier and a selector of all the fields you want from the user object

export const CreateUserAccount = async (req: Request, res: Response) => {
  try {
    await prisma.user.deleteMany();
    const { first_name, last_name, phone, password, email } = req.body as User;
    console.log(first_name, last_name, phone, password, email);

    //check user

    const userExists = (await checkUser({ phone, email })) as CheckUserResult;
    if (userExists.userPresent) {
      res.status(400).json({ message: "user already exists" });
      return;
    }

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
        dateCreated: new Date(),
      },
    });
    //generate token using user details
    const tokenObj = {
      first_name: user.first_name,
      last_name: user.last_name,
      id: user.id,
    } as User;

    const token = await CreateToken(tokenObj);
    //update it in the database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { ...user, sessionToken: token },
    });
    console.log(updatedUser);

    //return clean user

    const {
      password: userPassword,
      salt: userSalt,
      ...cleanUser
    } = updatedUser as User;
    res.status(200).send(cleanUser);
  } catch (err: any) {
    res.status(400).send(err.message);
  }
};
export const LoginUser = async (req: Request, res: Response) => {
  try{

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
        sessionToken: true,
      }
    );
    console.log(checkUserResult);
  
    if (checkUserResult) {
      const { user, userPresent } = checkUserResult;
      if (!userPresent) {
        res.status(404).json({ message: "User not found" });
        return;
      }
  
      if (phone !== user?.phone) {
        res.status(401).json({ message: "unauthorized" });
        return;
      }
      //match passwords
      const passwordHashed = user.password;
      const passwordMatch = await DecryptPassword({ password, passwordHashed });
      if (!passwordMatch) {
        res.status(401).json({ message: "unauthorized" });
        return;
      }
      //verify token- if none, create a new one and update it on the db.
      if (user.sessionToken !== null) {
        const isTokenValid = await VerifyToken(user.sessionToken);
        console.log("is token valid", isTokenValid);
        if (!isTokenValid) {
          const tokenObj = {
            first_name: user.first_name,
            last_name: user.last_name,
            id: user.id,
          } as User;
  
          const token = await CreateToken(tokenObj);
          const updatedUser = await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              ...user,
              sessionToken: token,
            },
          });
          const { password, ...cleanUser } = updatedUser;
          res.status(200).json({
            message: "login successfull, new token assigned",
            user: cleanUser,
          });
        } else {
          const { password, ...cleanUser } = user;
          res.status(200).json({
            message: "login successfull, using old token",
            user: cleanUser,
          });
        }
      } else {
        const tokenObj = {
          first_name: user.first_name,
          last_name: user.last_name,
          id: user.id,
        } as User;
        const token = await CreateToken(tokenObj);
        const updatedUser = await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            ...user,
            sessionToken: token,
          },
        });
        const { password, ...cleanUser } = updatedUser;
        res.status(200).json({
          message: "login successfull, new token assigned",
          user: cleanUser,
        });
      }
    } else {
      res.status(401).json({ message: "user not found" });
    }
  } catch(err){
    res.status(400).json({message: "something went wrong"})
  }
};
export const DeleteUserAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    console.log(id);
    const userExists = await checkUser({ id });
    console.log(userExists);
    if (userExists?.userPresent === false) {
      res.status(404).json({ message: "user does not exist" });
      return;
    }
    //verify session using by matching body id to the session id.
    const user = userExists?.user;
    await prisma.user.delete({
      where: {
        id: user!.id,
      },
    });
    res.status(200).json({ message: "Delete successfull" });
  } catch (err) {}
};
export const UpdateUserDetails = async (req: Request, res: Response) => {
  try {
    res.send("update user details");
  } catch (err) {}
};
export const GetUserProfile = async (req: Request, res: Response) => {
  const { id } = req.body;
  console.log(id, "identifier");

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
    console.log(checkUserResult);

    if (checkUserResult) {
      const { user } = checkUserResult;
      res.status(200).json(user);
    } else {
      res.status(400).json({ message: "user not found" });
    }
  } catch (err) {
    res.status(400).json({ message: "something went wrong" });
  }
};
