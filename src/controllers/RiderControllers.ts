import { PrismaClient, Rider } from "@prisma/client";
import { Request, Response } from "express";
import { CheckRiderResult, checkRider } from "../helpers/user";
import PasswordHash, { DecryptPassword } from "../helpers/PasswordHash";
import { CreateToken, VerifyToken } from "../helpers/CreateToken";
import {UserType} from "../helpers/enums";
import {UpdateRiderStatusOnRegistration} from "./RidersVerification";

const prisma = new PrismaClient();

export const CreateRiderAccount = async (req: Request, res: Response) => {
  try {
    // await prisma.rider.deleteMany();
    const { first_name, last_name, phone, password, email } = req.body as Rider;

    //check rider
    const riderExists = (await checkRider({
      phone,
      email,
    })) as CheckRiderResult;
    if (riderExists.riderPresent) {
      res.status(400).json({ message: "rider already exists" });
      return;
    }

    //hash password and get hashed pass and salt.
    const { passwordHashed, salt } = await PasswordHash(password);

    //add to db
    const rider = await prisma.rider.create({
      data: {
        first_name: first_name,
        last_name: last_name,
        password: passwordHashed,
        salt: salt,
        phone: phone,
        dateCreated: new Date(),
      },
    });
    //generate token using rider details
    const tokenObj = {
      first_name: rider.first_name,
      last_name: rider.last_name,
      id: rider.id,
      type: UserType.RIDER,
    };

    const token: string = await CreateToken(tokenObj);
    //update it in the database
    const updatedRider = (await prisma.rider.update({
      where: { id: rider.id },
      data: { ...rider, sessionToken: token },
    })) as Rider;
    // Assign Customer care agent approver if we have one who is free
    await UpdateRiderStatusOnRegistration(updatedRider['id'], {})
    //return clean rider

    const {
      password: riderPassword,
      salt: riderSalt,
      ...cleanRider
    } = updatedRider as Rider;
    res.status(200).send(cleanRider);
  } catch (err: any) {
    res.status(400).send(err.message);
  }
};
export const LoginRider = async (req: Request, res: Response) => {
  try {
    const { phone, email, password } = req.body as Rider;
    //check rider
    const checkRiderResult = await checkRider(
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

    if (checkRiderResult) {
      const { rider, riderPresent } = checkRiderResult as CheckRiderResult;
      if (!riderPresent) {
        res.status(404).json({ message: "rider not found" });
        return;
      }

      if (phone !== rider?.phone) {
        res.status(401).json({ message: "unauthorized" });
        return;
      }
      //match passwords
      const passwordHashed: string = rider.password;
      const passwordMatch: boolean = await DecryptPassword({
        password,
        passwordHashed,
      });
      if (!passwordMatch) {
        res.status(401).json({ message: "unauthorized" });
        return;
      }
      //verify token- if none, create a new one and update it on the db.
      if (rider.sessionToken !== null) {
        const isTokenValid = await VerifyToken(rider.sessionToken);
        if (!isTokenValid) {
          const tokenObj = {
            first_name: rider.first_name,
            last_name: rider.last_name,
            id: rider.id,
            type: UserType.RIDER,
          };

          const token: string = await CreateToken(tokenObj);
          const updatedRider = (await prisma.rider.update({
            where: {
              id: rider.id,
            },
            data: {
              ...rider,
              sessionToken: token,
            },
          })) as Rider;
          const { password, ...cleanRider } = updatedRider as Rider;
          res.status(200).json({
            message: "Rider login successfull, new token assigned",
            rider: cleanRider,
          });
        } else {
          const { password, ...cleanRider } = rider as Rider;
          res.status(200).json({
            message: "Rider login successfull, using old token",
            rider: cleanRider,
          });
        }
      } else {
        const tokenObj = {
          first_name: rider.first_name,
          last_name: rider.last_name,
          id: rider.id,
          type: UserType.RIDER,
        };
        const token: string = await CreateToken(tokenObj);
        const updatedRider = (await prisma.rider.update({
          where: {
            id: rider.id,
          },
          data: {
            ...rider,
            sessionToken: token,
          },
        })) as Rider;
        const { password, ...cleanRider } = updatedRider as Rider;
        res.status(200).json({
          message: "Rider login successfull, new token assigned",
          rider: cleanRider,
        });
      }
    } else {
      res.status(401).json({ message: "rider not found" });
    }
  } catch (err) {
    res.status(400).json({ message: "something went wrong" });
  }
};
export const DeleteRiderAccount = async (req: Request, res: Response) => {
  try {
    const { id }: { id: string } = req.body;

    const riderExists = (await checkRider({ id })) as CheckRiderResult;

    if (riderExists?.riderPresent === false) {
      res.status(404).json({ message: "user does not exist" });
      return;
    }
    //verify session using by matching body id to the session id.
    const rider: Rider | null = riderExists?.rider;
    await prisma.rider.delete({
      where: {
        id: rider!.id,
      },
    });
    res.status(200).json({ message: "Delete successfull" });
  } catch (err) {
    res.status(400).json({ message: "something went wrong" });
  }
};
export const UpdateRiderAccount = async (req: Request, res: Response) => {
  res.send("update-rider-accont");
};
export const GetRiderProfile = async (req: Request, res: Response) => {
  const { id }: { id: string } = req.body;

  try {
    const checkRiderResult = await checkRider(
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

    if (checkRiderResult) {
      const { rider }: { rider: Rider | null } = checkRiderResult;
      res.status(200).json(rider);
    } else {
      res.status(400).json({ message: "rider not found" });
    }
  } catch (err) {
    res.status(400).json({ message: "something went wrong" });
  }
};
