import {PrismaClient} from '@prisma/client'
import {Response} from "express";
import PasswordHash from "../helpers/PasswordHash";

const prisma = new PrismaClient()

interface CheckUserProps {
    email: string;
}

const checkUser = async ({email}: CheckUserProps) => {
    const user = await prisma.customerCareAgent.findUnique({
        where: {
            email: email,
        },
    });
    if (user) {
        return true;
    }
    return false;
}

interface CustomerCareAgentInterface {
    id: number;
    createdAt: Date;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    salt: string;
    is_active: Boolean
}

export const CustomerCareAgent = async (req: any, res: Response) => {
    try {
        const {email, first_name, last_name, password} = req.body;
        const userExists = await checkUser({email});
        if (userExists) {
            res.status(400).json({message: "user already exists"});
            return;
        }
        const {passwordHashed, salt} = await PasswordHash(password);
        const agent = await prisma.customerCareAgent.create({
            data: {
                email: email,
                first_name: first_name,
                last_name: last_name,
                password: passwordHashed,
                salt: salt,
            },
        })
        res.json(agent)
    } catch (err: any) {
        res.send(err.message);
    }
}