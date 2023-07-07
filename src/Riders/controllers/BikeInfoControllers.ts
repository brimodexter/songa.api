import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { CheckRiderResult, checkRider } from "../../helpers/user";


const prisma= new PrismaClient();
export const addBikeInfo = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        bikeType,
        plateNumber,
        bikePhoto,
        insuranceProvider,
        insurancePolicyNumber,
      } = req.body;
      //check Rider
      const riderExists = (await checkRider({ id })) as CheckRiderResult;
      if (!riderExists.riderPresent) {
        res.status(400).json({
          message:
            "Rider not present. To have a profile, a rider must have an account",
        });
      }
      //check profile- must be checked because the bike info is in the profile
      
      const hasProfile = await prisma.riderProfile.findUnique({
        where: {
          riderId: riderExists.rider?.id,
        },
      });
      if (!hasProfile) {
        res.status(401).json({
          message:
            "A rider must have a profile in order to add bike information. Please create a profile for them first",
        });
        return;
      }
      if (hasProfile) {
        //check if they have bike info available
        const hasBikeInfo = await prisma.bikeInformation.findUnique({
          where: {
            riderId: hasProfile.riderId,
          },
        });
        if (hasBikeInfo) {
          res
            .status(401)
            .json({
              message:
                "The rider already has bike information. If you want to update please use the update-bike-info endpoint",
            });
          return;
        }
        //if the bike bike photo is present, first upload it to cloudinary to get the secure link. store the link in the db.- ###will do later
        const addBikeInformation = await prisma.bikeInformation.create({
          data: {
            riderId: hasProfile.riderId,
            bikeType: bikeType || null,
            bikePhoto: bikePhoto || null,
            plateNumber: plateNumber || null,
            insuranceProvider: insuranceProvider || null,
            insurancePolicyNumber: insurancePolicyNumber || null,
          },
        });
        res.status(200).json({
          message: "Bike information added successfully",
          bikeInfo: addBikeInformation,
        });
      }
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  };
  