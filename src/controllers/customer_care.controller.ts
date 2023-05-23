import {PrismaClient} from '@prisma/client'
import {Response, Request} from "express";
import {SafeParseSuccess, z} from "zod";

import PasswordHash from "../helpers/PasswordHash";
import {CheckCCA, checkCustomerCareAgent, CheckUserResult} from "../helpers/user";
import {verifyCCA} from "../helpers/SendMail";
import logger from "../helpers/logging";

const prisma = new PrismaClient()

const CustomerCareAgentSchema = z.object({
        email: z.coerce.string().email().nonempty({message: 'Email is required',}),
        first_name: z.string().trim().nonempty({message: 'First name is required',}),
        last_name: z.string().trim().nonempty({message: 'Last name is required',}),
        // This regex will enforce these rules:
        // At least one digit, (?=.*?[0-9])
        // At least one special character, (?=.*?[#?!@$%^&*-])
        // Minimum eight in length .{8,} (with the anchors)
        password: z.string().regex(/^(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, "Minimum eight characters, at least one number and one special character:").trim().nonempty({message: 'Password is required'})
    })
;


export const CustomerCareAgent = async (req: any, res: Response) => {
    try {
        let validationResponse = CustomerCareAgentSchema.safeParse(req.body);
        if (!validationResponse.success) {
            res.status(400).send(validationResponse.error.format());
            return;
        }

        let {data} = validationResponse as SafeParseSuccess<any>;
        let email = data.email
        const userExists: CheckCCA | undefined = await checkCustomerCareAgent({email});
        if (userExists && userExists.userPresent) {
            res.status(400).json({email: "user already exists"});
            return;
        }
        const {passwordHashed, salt} = await PasswordHash(data.password);
        data.password = passwordHashed;
        data.salt = salt;
        const agent = await prisma.customerCareAgent.create({
            data: {...data},
            select: {
                first_name: true,
                last_name: true,
                email: true,
                created_at: true,
                is_active: true,
                id: true
            }
        });
        await verifyCCA(agent)
        res.json(agent)
    } catch (err: any) {
        logger.error("Error signing up new CCA: ", err)
        res.status(500).send({"error": "Internal Server Error"});
    }
}

export const CCAVerification = async (req: Request, res: Response) => {
    try {
        const {id, token} = req.params;
        // const token =req.query.token
        const userExists: CheckCCA | undefined = await checkCustomerCareAgent({id},);
        if (userExists && userExists.user) {
            const tokenObject = await prisma.customerCareAgentToken.findFirst({
                where: {
                    userId: id,
                    token: token
                }
            });
            if (!tokenObject) return res.status(400).send("Invalid link");
            const updatedPost = await prisma.customerCareAgent.update({
                where: {id: req.params.id},
                data: {verified: true},
            });
            const deleteToken = await prisma.customerCareAgentToken.delete({
                where: {
                    userId: id
                }
            })
        } else {
            if (!userExists) return res.status(400).send("Invalid link");
        }
        res.send("email verified successfully");
    } catch (error) {
        logger.error("Error email in verifying new CCA: ", error)
        res.status(400).send({"error": "Internal Server Error"});
    }
};
