import {Prisma, PrismaClient, User} from "@prisma/client";

const prisma = new PrismaClient();

interface CheckUserProps {
    phone?: string;
    email?: string | null;
    id?: string;
}

export type CheckUserResult = {
    userPresent: boolean;
    user: User | null;
};

export const checkUser = async (
    {phone, email, id}: CheckUserProps,
    select?: Prisma.UserSelect
): Promise<CheckUserResult | undefined> => {
    console.log(phone, email, id)
    if (id) {
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
            select: select,
        });
        if (user) {
            return {userPresent: true, user: user} as CheckUserResult;
        }
        return {userPresent: false, user: null} as CheckUserResult;
    }
    if (phone) {
        const user = await prisma.user.findUnique({
            where: {
                phone: phone,
            },
            select: select,
        });
        if (user) {
            return {userPresent: true, user: user} as CheckUserResult;
        }
        return {userPresent: false, user: null} as CheckUserResult;
    }
    if (email) {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
            select: select,
        });
        if (user) {
            return {userPresent: true, user: user} as CheckUserResult;
        }
        return {userPresent: false, user: null} as CheckUserResult;
    }
    return undefined;
};

export const checkCustomerCareAgent = async (
    {phone, email, id}: CheckUserProps,
    select?: Prisma.UserSelect
): Promise<CheckUserResult | undefined> => {
    if (id) {
        const user = await prisma.customerCareAgent.findUnique({
            where: {
                id: id,
            },
            select: select,
        });
        if (user) {
            return {userPresent: true, user: user} as CheckUserResult;
        }
        return {userPresent: false, user: null} as CheckUserResult;
    }
    if (email) {
        const user = await prisma.customerCareAgent.findUnique({
            where: {
                email: email,
            },
            select: select,
        });
        if (user) {
            return {userPresent: true, user: user} as CheckUserResult;
        }
        return {userPresent: false, user: null} as CheckUserResult;
    }
    return undefined;
};