import { Router } from "express";
import express from "express";

import { addBikeInfo } from "../controllers/BikeInfoControllers";
import { createRiderProfile, deleteRiderProfile, updateRiderProfile } from "../controllers/RiderProfilesControllers";

const router: Router = express();

router.post("/create-profile/:id", createRiderProfile);
router.put("/update-profile/:id", updateRiderProfile);
router.delete("/delete-rider-profile/:id", deleteRiderProfile);
router.post("/add-bike-info/:id", addBikeInfo);

export default router;
