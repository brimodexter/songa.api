import {
  CustomerCareAgent,
  Prisma,
  PrismaClient,
  Rider,
  User,
} from '@prisma/client';

const prisma = new PrismaClient();

export interface CheckUserProps {
  phone?: string;
  email?: string | null;
  id?: string;
}
export interface CheckRiderProps {
  phone?: string;
  email?: string | null;
  id?: string;
}

export type CheckUserResult = {
  userPresent: boolean;
  user: User | null;
};
export type CheckRiderResult = {
  riderPresent: boolean;
  rider: Rider | null;
};

export type CheckCCA = {
  userPresent: boolean;
  user: CustomerCareAgent | null;
};
export const checkUser = async (
  { phone, email, id }: CheckUserProps,
  select?: Prisma.UserSelect
): Promise<CheckUserResult | undefined> => {
  if (id) {
    const user = (await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: select,
    })) as User;
    if (user) {
      return { userPresent: true, user: user } as CheckUserResult;
    }
    return { userPresent: false, user: null } as CheckUserResult;
  }
  if (phone) {
    const user = (await prisma.user.findUnique({
      where: {
        phone: phone,
      },
      select: select,
    })) as User;
    if (user) {
      return { userPresent: true, user: user } as CheckUserResult;
    }
    return { userPresent: false, user: null } as CheckUserResult;
  }
  if (email) {
    const user = (await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: select,
    })) as User;
    if (user) {
      return { userPresent: true, user: user } as CheckUserResult;
    }
    return { userPresent: false, user: null } as CheckUserResult;
  }
  return undefined;
};
export const checkRider = async (
  { phone, email, id }: CheckRiderProps,
  select?: Prisma.UserSelect
): Promise<CheckRiderResult | undefined> => {
  console.log(phone, email, id);
  if (id) {
    const rider = (await prisma.rider.findUnique({
      where: {
        id: id,
      },
      select: select,
    })) as Rider;
    if (rider) {
      return { riderPresent: true, rider: rider } as CheckRiderResult;
    }
    return { riderPresent: false, rider: null } as CheckRiderResult;
  }
  if (phone) {
    const rider = (await prisma.rider.findUnique({
      where: {
        phone: phone,
      },
      select: select,
    })) as Rider;
    if (rider) {
      return { riderPresent: true, rider: rider } as CheckRiderResult;
    }
    return { riderPresent: false, rider: null } as CheckRiderResult;
  }
  if (email) {
    const rider = (await prisma.rider.findUnique({
      where: {
        email: email,
      },
      select: select,
    })) as Rider;
    if (rider) {
      return { riderPresent: true, rider: rider } as CheckRiderResult;
    }
    return { riderPresent: false, rider: null } as CheckRiderResult;
  }
  return undefined;
};

export const checkCustomerCareAgent = async (
  { email, id }: CheckUserProps,
  select?: Prisma.CustomerCareAgentSelect
): Promise<CheckCCA | undefined> => {
  if (id) {
    const user = await prisma.customerCareAgent.findUnique({
      where: {
        id: id,
      },
      select: select,
    });
    if (user) {
      return { userPresent: true, user: user } as CheckCCA;
    }
    return { userPresent: false, user: null } as CheckCCA;
  }
  if (email) {
    const user = await prisma.customerCareAgent.findUnique({
      where: {
        email: email,
      },
      select: select,
    });
    if (user) {
      return { userPresent: true, user: user } as CheckCCA;
    }
    return { userPresent: false, user: null } as CheckCCA;
  }
  return undefined;
};
