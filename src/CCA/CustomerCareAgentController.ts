import { Prisma, PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { SafeParseSuccess } from 'zod';
import PasswordHash, { DecryptPassword } from '../helpers/PasswordHash';
import { CheckCCA, checkCustomerCareAgent } from '../helpers/user';
import { CreateToken, VerifyToken } from '../helpers/CreateToken';
import logger from '../helpers/logging';
import { sendResetPassword, verifyCCA } from '../helpers/SendMail';
import { UserType } from '../helpers/enums';
import {
  CustomerCareAgentLoginSchema,
  CustomerCareAgentSchema,
  CustomerCareAgentUpdateSchema,
  PasswordResetRequestSchema,
  PasswordResetResponseSchema,
} from './CustomerCareAgentValidator';

const prisma = new PrismaClient();
const LIMIT = 50;
const OFFSET = 0;

export const CustomerCareAgent = async (req: any, res: Response) => {
  try {
    const validationResponse = CustomerCareAgentSchema.safeParse(req.body);
    if (!validationResponse.success) {
      res.status(400).send(validationResponse.error.format());
      return;
    }

    const { data } = validationResponse as SafeParseSuccess<any>;
    const email = data.email;
    const userExists: CheckCCA | undefined = await checkCustomerCareAgent({
      email,
    });
    if (userExists && userExists.userPresent) {
      res.status(400).json({ email: 'user already exists' });
      return;
    }
    const { passwordHashed, salt } = await PasswordHash(data.password);
    data.password = passwordHashed;
    data.salt = salt;
    const agent = await prisma.customerCareAgent.create({
      data: { ...data },
      select: {
        first_name: true,
        last_name: true,
        email: true,
        created_at: true,
        is_active: true,
        id: true,
      },
    });
    await verifyCCA(agent);
    res.json(agent);
  } catch (err: any) {
    logger.error('Error signing up new CCA: ', err);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};

export const LoginCCA = async (req: Request, res: Response) => {
  try {
    const validationResponse = CustomerCareAgentLoginSchema.safeParse(req.body);
    if (!validationResponse.success) {
      res.status(400).send(validationResponse.error.format());
      return;
    }
    const { data } = validationResponse as SafeParseSuccess<any>;
    //check user
    const { email, password } = data;
    const userExists: CheckCCA | undefined = await checkCustomerCareAgent(
      { email },
      {
        first_name: true,
        last_name: true,
        email: true,
        created_at: true,
        updated_at: true,
        is_active: true,
        verified: true,
        id: true,
        sessionToken: true,
        password: true,
      }
    );
    if (userExists && userExists.user) {
      const user = userExists.user;
      const passwordHashed: string = user.password;
      const passwordMatch: boolean = await DecryptPassword({
        password,
        passwordHashed,
      });
      if (!passwordMatch) {
        res.status(401).json({ message: 'unauthorized' });
        return;
      }
      if (!userExists.user.verified) {
        res.status(401).json({ message: 'Kindly verify your email' });
        return;
      }
      if (!userExists.user.is_active) {
        res.status(401).json({
          message: 'User is currently inactive. Contact support',
        });
        return;
      }
      const isTokenValid =
        user.sessionToken && (await VerifyToken(user.sessionToken));
      if (isTokenValid) {
        // const {password, ...cleanUser} = user;
        Reflect.deleteProperty(user, 'password');
        res.status(200).json({
          message: 'login successfully, using old token',
          user: user,
        });
      } else {
        const tokenObj = {
          first_name: user.first_name,
          last_name: user.last_name,
          id: user.id,
          type: UserType.CCA,
        };

        const token: string = await CreateToken(tokenObj);
        const updatedUser = await prisma.customerCareAgent.update({
          where: {
            id: user.id,
          },
          data: {
            ...user,
            sessionToken: token,
          },
          select: {
            first_name: true,
            last_name: true,
            email: true,
            created_at: true,
            updated_at: true,
            is_active: true,
            id: true,
            sessionToken: true,
          },
        });
        res.status(200).json({
          message: 'login successfully, new token assigned',
          user: updatedUser,
        });
      }
    } else {
      res.status(401).json({ message: 'unauthorized' });
      return;
    }
  } catch (err) {
    logger.error('Error while logging in a new CCA: ', err);
    res.status(500).send({ error: 'Internal Server Error' });
  }
};
export const UpdateCCA = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    //todo ensure authorisation and permission are working
    //todo Update timestamp on update
    const validationResponse = CustomerCareAgentUpdateSchema.safeParse(
      req.body
    );
    if (!validationResponse.success) {
      res.status(400).send(validationResponse.error.format());
      return;
    }
    const { data } = validationResponse as SafeParseSuccess<any>;
    const checkUserResult = await prisma.customerCareAgent.update({
      where: {
        id: id,
      },
      data: { ...data, updated_at: new Date() },
      select: {
        first_name: true,
        last_name: true,
        email: true,
        created_at: true,
        updated_at: true,
        is_active: true,
        id: true,
      },
    });

    res.status(200).json(checkUserResult);
    return;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (err.code === 'P2025') {
        console.log(err);
        res.status(404).json({ message: 'user not found' });
        return;
      }
    }
    logger.error('Error updating CCA: ', err);
    res.status(500).json({ message: 'something went wrong' });
    return;
  }
};

export const GetProfileCCA = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const checkUserResult = (await checkCustomerCareAgent(
      { id: id },
      {
        first_name: true,
        last_name: true,
        email: true,
        created_at: true,
        updated_at: true,
        is_active: true,
        id: true,
      }
    )) as CheckCCA;

    if (checkUserResult && checkUserResult.user) {
      const { user }: { user: any | null } = checkUserResult;
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ message: 'user not found' });
    }
  } catch (err) {
    logger.error('Error getting CCA profile: ', err);
    return res.status(500).json({ message: 'something went wrong' });
  }
};

export const CCAVerification = async (req: Request, res: Response) => {
  try {
    const { id, token } = req.params;
    const userExists: CheckCCA | undefined = await checkCustomerCareAgent({
      id,
    });
    if (userExists && userExists.user) {
      const tokenObject = await prisma.customerCareAgentToken.findFirst({
        where: {
          userId: id,
          token: token,
        },
      });
      if (!tokenObject) return res.status(400).send('Invalid link');
      await prisma.customerCareAgent.update({
        where: { id: req.params.id },
        data: { verified: true },
      });
      await prisma.customerCareAgentToken.delete({
        where: {
          userId: id,
        },
      });
      return res.send('email verified successfully');
    }
    return res.status(400).send('Invalid link');
  } catch (error) {
    logger.error('Error email in verifying new CCA: ', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};

const getOffsetPagination = (query: any) => {
  const offset = isNaN(Number(query.offset)) ? OFFSET : parseInt(query.offset);
  const limit = isNaN(Number(query.limit)) ? LIMIT : parseInt(query.limit);
  return { offset, limit };
};
export const getAllCCA = async (req: Request, res: Response) => {
  const { query } = req;
  const { offset, limit } = getOffsetPagination(query);
  try {
    const totalCount = await prisma.customerCareAgent.count();
    const data = await prisma.customerCareAgent.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
      select: {
        first_name: true,
        last_name: true,
        email: true,
        created_at: true,
        updated_at: true,
        is_active: true,
        verified: true,
        id: true,
      },
    });
    return res.status(200).json({ count: totalCount, data: data });
  } catch (err) {
    logger.error('Error getting paginated Customer Care Agents ', err);
    return res.status(500).json(err);
  }
};

export const requestPasswordResetRequest = async (
  req: Request,
  res: Response
) => {
  const validationResponse = PasswordResetRequestSchema.safeParse(req.body);
  if (!validationResponse.success) {
    return res.status(400).send(validationResponse.error.format());
  }

  const { data } = validationResponse as SafeParseSuccess<any>;
  const email = data.email;
  const userExists: CheckCCA | undefined = await checkCustomerCareAgent({
    email,
  });
  if (userExists && userExists.user) {
    await sendResetPassword(userExists.user);
    return res
      .status(200)
      .json({ message: 'Email sent if email exists in our database' });
  }
  return res.status(400).json({ email: 'User does not exist' });
};

export const requestPasswordResetResponse = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, token } = req.params;
    const validationResponse = PasswordResetResponseSchema.safeParse(req.body);
    if (!validationResponse.success) {
      return res.status(400).send(validationResponse.error.format());
    }

    const { data } = validationResponse as SafeParseSuccess<any>;
    const userExists: CheckCCA | undefined = await checkCustomerCareAgent({
      id,
    });
    if (userExists && userExists.user) {
      const tokenObject = await prisma.customerCareAgentResetToken.findFirst({
        where: {
          userId: id,
          token: token,
        },
      });
      if (!tokenObject)
        return res.status(400).send({ message: 'Token not found' });
      const { passwordHashed, salt } = await PasswordHash(data.password);
      const agent = await prisma.customerCareAgent.update({
        where: {
          id: id,
        },
        data: {
          password: passwordHashed,
          salt: salt,
          updated_at: new Date(),
        },
        select: {
          first_name: true,
          last_name: true,
          email: true,
          created_at: true,
          updated_at: true,
          is_active: true,
          id: true,
        },
      });
      await prisma.customerCareAgentResetToken.delete({
        where: {
          userId: id,
        },
      });
      return res.status(200).json({ message: 'Reset successful', user: agent });
    }
    return res.status(400).send({ message: 'Invalid link' });
  } catch (error) {
    logger.error('Error in email reset response verifying new CCA: ', error);
    return res.status(500).send({ error: 'Internal Server Error' });
  }
};
