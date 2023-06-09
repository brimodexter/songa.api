import {SafeParseSuccess, z} from "zod";
import {RiderStatusEnum} from "@prisma/client";
import {NextFunction, Request, Response} from 'express';
import {CheckCCA, checkCustomerCareAgent, checkRider, CheckRiderResult} from "../../helpers/user";

/*
// Ride approval
// on rider registering assign them to Customer Care Agent for approval or add them without CC agent.
// endpoint to update approval(whether suspended or approved, assign CCA agent, message)
// On rider being approved, check on the queue whether we have riders that are pending approval
 */
export const CustomerCareAgentSchema = z.object({
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

export const CustomerCareAgentLoginSchema = z.object({
        email: z.coerce.string().email().nonempty({message: 'Email is required',}),
        password: z.string().trim().nonempty({message: 'Password is required'})
    })
;

export const CustomerCareAgentUpdateSchema = z.object({
    first_name: z.string().trim().nonempty({message: 'First name is required',}).optional(),
    last_name: z.string().trim().nonempty({message: 'Last name is required',}).optional(),
    is_active: z.boolean({invalid_type_error: "isActive must be a boolean"}).optional(),
})

export const PasswordResetRequestSchema = z.object({
    email: z.coerce.string().email().nonempty({message: 'Email is required',}),
});

export const PasswordResetResponseSchema = z.object({
    password: z.string().regex(/^(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, "Minimum eight characters, at least one number and one special character:").trim().nonempty({message: 'Password is required'})
})

const RiderStatusEnumSchema = z.nativeEnum(RiderStatusEnum).optional();

const isCCA = async (id: string | undefined) => {
    if (!id) {
        return true;
    }
    const userExists: CheckCCA | undefined = await checkCustomerCareAgent({id});
    return !!(userExists && userExists.userPresent);
}
export const RiderApprovalStatus = z.object({
    status: RiderStatusEnumSchema,
    message: z.string().trim().optional(),
    cca_id: z.string().trim().optional()
        .refine(isCCA, (val) => ({
            message: `${val} is not not found in the database`,
        }))
})

export interface CustomRequest extends Request {
    data: object;
}

const ValidateInput = async (req: Request, res: Response, next: NextFunction, schema: any) => {
    let validationResponse = await schema.safeParseAsync(req.body);
    if (!validationResponse.success) {
        return res.status(400).send(validationResponse.error.format());
    }
    let {data} = validationResponse as SafeParseSuccess<any>;
    (req as CustomRequest).data = data;
    next();
}

export const validateRiderApprovalStatus = (req: Request, res: Response, next: NextFunction) => {
    return ValidateInput(req, res, next, RiderApprovalStatus)
}
