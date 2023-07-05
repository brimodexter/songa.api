import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { ValidateInput } from '../helpers/Validation';
/*
// Ride approval
// on rider registering assign them to Customer Care Agent for approval or add them without CC agent.
// endpoint to update approval(whether suspended or approved, assign CCA agent, message)
// On rider being approved, check on the queue whether we have riders that are pending approval
 */
export const LatLongSchema = z.object({
  latitude: z
    .number({
      required_error: 'latitude is required',
      invalid_type_error: 'latitude must be a number',
    })
    .gt(-90)
    .lt(90),
  longitude: z
    .number({
      required_error: 'longitude is required',
      invalid_type_error: 'longitude must be a number',
    })
    .gt(-180)
    .lt(180),
});

export const validateLatLong = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return ValidateInput(req, res, next, LatLongSchema);
};
