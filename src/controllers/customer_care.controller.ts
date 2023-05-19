import {PrismaClient} from '@prisma/client'
import {Response} from "express";
import {SafeParseSuccess, z} from "zod";
import PasswordHash from "../helpers/PasswordHash";
import {checkCustomerCareAgent, checkUser, CheckUserResult} from "../helpers/user";

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
        const userExists: CheckUserResult | undefined = await checkCustomerCareAgent({email});
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
        res.json(agent)
    } catch (err: any) {
        console.log('Internal Server Error:', err.message)
        res.status(500).send({"error": "Internal Server Error"});
    }
}