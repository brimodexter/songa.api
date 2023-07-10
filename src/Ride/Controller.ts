import { Request, Response } from 'express';
import { S2 } from 's2-geometry';
import app from '../app';
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({});

export const RiderPostLocation = async (req: any, res: Response) => {
  // Available
  // On riding
  if (typeof app.locals.groups == 'undefined') {
    app.locals.groups = {};
  }
  try {
    const { latitude, longitude } = req.body;
    await prisma.rider.update({
      where: {
        id: res.locals.payload.id,
      },
      data: {
        ...req.body,
      },
    });
    const rider_cell_id = S2.keyToId(S2.latLngToKey(latitude, longitude, 11));
    const group = app.locals.groups[rider_cell_id] || new Set();
    group.add(res.locals.payload.id);
    app.locals.groups[rider_cell_id] = group;
    return res
      .status(200)
      .json({ body: req.body, message: 'Location posted successfully' });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (err.code === 'P2025') {
        res.status(404).json({ message: 'Rider not found' });
        return;
      }
    }
    return res.status(500).send({ message: 'Unknown error' });
  }
};

export const UserGetNearbyRides = async (req: Request, res: Response) => {
  if (typeof app.locals.groups == 'undefined') {
    app.locals.groups = {};
  }
  const { latitude, longitude } = req.body;
  const customer_point_s2 = S2.keyToId(S2.latLngToKey(latitude, longitude, 11));
  const close_rider_points = app.locals.groups[customer_point_s2];
  if (!close_rider_points) {
    return res.status(404).json({ message: 'No riders found' });
  }
  const records = await prisma.rider.findMany({
    select: {
      latitude: true,
      longitude: true,
    },
    where: {
      id: {
        in: Array.from(close_rider_points),
      },
    },
  });
  return res.status(200).json({
    message: 'Riders found',
    locations: Array.from(records),
  });
};
export const UserRequestRide = (req: Request, res: Response) => {
  //pickup(coordinates) -> dropoff(coordinates)
};
export const RiderGetRequestedRides = (req: Request, res: Response) => {}; // websockets
export const RiderAcceptRide = (req: Request, res: Response) => {}; //websockets
export const UserNotifiedRide = (req: Request, res: Response) => {}; //websockets
export const UserRiderShareLocation = (req: Request, res: Response) => {}; //websockets
export const UserCancelRide = (req: Request, res: Response) => {}; //Rest -> driver websockets
export const RiderCancelRide = (req: Request, res: Response) => {}; //rest -> . user via sockets
