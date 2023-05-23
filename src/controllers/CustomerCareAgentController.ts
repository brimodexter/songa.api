import {Prisma, PrismaClient, User} from '@prisma/client'
import {Request, Response} from "express";
import {SafeParseSuccess, z} from "zod";
import PasswordHash, {DecryptPassword} from "../helpers/PasswordHash";
import {CheckCCA, checkCustomerCareAgent} from "../helpers/user";
import {CreateToken, VerifyToken} from "../helpers/CreateToken";
import logger from "../helpers/logging";
import {verifyCCA} from "../helpers/SendMail";

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

const CustomerCareAgentLoginSchema = z.object({
        email: z.coerce.string().email().nonempty({message: 'Email is required',}),
        password: z.string().trim().nonempty({message: 'Password is required'})
    })
;

const CustomerCareAgentUpdateSchema = z.object({
    first_name: z.string().trim().nonempty({message: 'First name is required',}).optional(),
    last_name: z.string().trim().nonempty({message: 'Last name is required',}).optional(),
    is_active: z.boolean({invalid_type_error: "isActive must be a boolean"}).optional(),
})

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


export const LoginCCA = async (req: Request, res: Response) => {
        try {
            let validationResponse = CustomerCareAgentLoginSchema.safeParse(req.body);
            if (!validationResponse.success) {
                res.status(400).send(validationResponse.error.format());
                return;
            }
            let {data} = validationResponse as SafeParseSuccess<any>;
            //check user
            let {email, password} = data;
            const userExists: CheckCCA | undefined = await checkCustomerCareAgent({email},
                {
                    first_name: true,
                    last_name: true,
                    email: true,
                    created_at: true,
                    updated_at: true,
                    is_active: true,
                    id: true,
                    sessionToken:true,
                    password:true
                });
            if (userExists && userExists.user) {
                let user = userExists.user;
                const passwordHashed: string = user.password;
                const passwordMatch: boolean = await DecryptPassword({
                    password,
                    passwordHashed,
                });
                if (!passwordMatch) {
                    res.status(401).json({message: "unauthorized"});
                    return;
                }
                const isTokenValid = user.sessionToken && await VerifyToken(user.sessionToken);
                if (isTokenValid) {
                    const {password, ...cleanUser} = user;
                    res.status(200).json({
                        message: "login successfully, using old token",
                        user: cleanUser,
                    });
                } else {
                    const tokenObj = {
                        first_name: user.first_name,
                        last_name: user.last_name,
                        id: user.id,
                    } as User;

                    const token: string = await CreateToken(tokenObj);
                    const updatedUser = (await prisma.customerCareAgent.update({
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
                            sessionToken:true
                        }
                    }));
                    res.status(200).json({
                        message: "login successfully, new token assigned",
                        user: updatedUser,
                    });
                }
            } else {
                res.status(401).json({message: "unauthorized"});
                return;
            }
        } catch (err) {
            logger.error("Error while logging in a new CCA: ", err)
            res.status(500).send({"error": "Internal Server Error"});
        }
    }
;
export const UpdateCCA = async (req: Request, res: Response) => {
    const {id} = req.params;
    try {
        //todo ensure authorisation and permission are working
        //todo Update timestamp on update
        let validationResponse = CustomerCareAgentUpdateSchema.safeParse(req.body);
        if (!validationResponse.success) {
            res.status(400).send(validationResponse.error.format());
            return;
        }
        let {data} = validationResponse as SafeParseSuccess<any>;
        const checkUserResult = (await prisma.customerCareAgent.update({
            where: {
                id: id,
            },
            data: data,
            select: {
                first_name: true,
                last_name: true,
                email: true,
                created_at: true,
                updated_at: true,
                is_active: true,
                id: true
            }
        }))

        res.status(200).json(checkUserResult);
        return
    } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
            // The .code property can be accessed in a type-safe manner
            if (err.code === 'P2025') {
                console.log(err)
                res.status(404).json({message: "user not found"});
                return;
            }
        }
        logger.error("Error updating CCA: ", err)
        res.status(500).json({message: "something went wrong"});
        return;
    }
};

export const GetProfileCCA = async (req: Request, res: Response) => {
    const {id} = req.params;

    try {
        const checkUserResult = (await checkCustomerCareAgent(
            {id: id},
            {
                first_name: true,
                last_name: true,
                email: true,
                created_at: true,
                updated_at: true,
                is_active: true,
                id: true
            }
        )) as CheckCCA;

        if (checkUserResult) {
            const {user}: { user: any | null } = checkUserResult;
            res.status(200).json(user);
            return;
        } else {
            res.status(404).json({message: "user not found"});
            return
        }
    } catch (err) {
        logger.error("Error getting CCA profile: ", err)
        res.status(500).json({message: "something went wrong"});
        return;
    }
};

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
