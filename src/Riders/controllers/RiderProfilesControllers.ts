import { Request, Response } from 'express';

import { PrismaClient } from '@prisma/client';
import { CheckRiderResult, checkRider } from '../../helpers/user';

const prisma = new PrismaClient();
export const createRiderProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { location, avatar, address, gender, documents, bikeInformation } =
    req.body;

  //check Rider
  const riderExists = (await checkRider({ id })) as CheckRiderResult;
  if (!riderExists.riderPresent) {
    res.status(400).json({
      message:
        'Rider not present. To have a profile, a rider must have an account',
    });
  }

  if (riderExists.rider) {
    //create their profile
    try {
      const riderProfile = await prisma.riderProfile.create({
        data: {
          riderId: riderExists.rider.id,
          location: location || null,
          avatar: avatar || null,
          address: address || null,
          gender: gender || null,
          documents: documents || undefined,
          bikeInformation: bikeInformation || undefined,
        },
      });
      res.status(200).json({
        message: 'Rider profile creation successfull',
        profile: riderProfile,
      });
    } catch (err) {
      res.status(400).json({ message: 'Something went wrong' });
    }
  }
};

export const updateRiderProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { location, avatar, address, gender, documents, bikeInformation } =
    req.body;
  //check Rider
  const riderExists = (await checkRider({ id })) as CheckRiderResult;
  if (!riderExists.riderPresent) {
    res.status(400).json({
      message:
        'Rider not present. To have a profile, a rider must have an account',
    });
  }

  if (riderExists.rider) {
    //check whether they have a profile.
    const hasProfile = await prisma.riderProfile.findUnique({
      where: { riderId: id },
    });
    if (!hasProfile) {
      res.status(400).json({
        message: 'This rider has no profile. Please create a profile first',
      });
      return;
    }

    try {
      const updatedRiderProfile = await prisma.riderProfile.update({
        where: { riderId: id },
        data: {
          riderId: riderExists.rider.id,
          location: location || null,
          avatar: avatar || null,
          address: address || null,
          gender: gender || null,
          documents: documents || undefined,
          bikeInformation: bikeInformation || undefined,
        },
      });

      res.status(200).json({
        message: 'Rider profile update successfull',
        profile: updatedRiderProfile,
      });
    } catch (err) {
      res
        .status(400)
        .json({ message: 'Something went wrong. Please try again later' });
    }
  }
};
export const deleteRiderProfile = async (req: Request, res: Response) => {
  const { id } = req.params;  
  //check Rider
  const riderExists = (await checkRider({ id })) as CheckRiderResult;
  if (!riderExists.riderPresent) {
    res.status(400).json({
      message:
        'Rider not present. To have a profile, a rider must have an account',
    });
    return;
  }
  //check whether they have a profile.
  const hasProfile = await prisma.riderProfile.findUnique({
    where: { riderId: id },
  });
  if (!hasProfile) {
    res.status(400).json({ message: 'This rider has no profile.' });
    return;
  }
  try {
    await prisma.riderProfile.delete({ where: { riderId: id } });
    res.status(200).json({ message: 'Rider Profile deleted successfully.' });
  } catch (err) {
    res
      .status(400)
      .json({ message: 'Something went wrong. Please try again.' });
  }
};
