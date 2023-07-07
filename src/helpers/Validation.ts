import { Request, Response, NextFunction } from 'express';
import { SafeParseSuccess } from 'zod';
export interface CustomRequest extends Request {
  data: object;
}

export const ValidateInput = async (
  req: Request,
  res: Response,
  next: NextFunction,
  schema: any
) => {
  const validationResponse = await schema.safeParseAsync(req.body);
  if (!validationResponse.success) {
    return res.status(400).send(validationResponse.error.format());
  }
  const { data } = validationResponse as SafeParseSuccess<any>;
  (req as CustomRequest).data = data;
  next();
};
