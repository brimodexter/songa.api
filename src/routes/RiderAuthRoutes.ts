import express, { Router } from "express";
import multer from "multer";

import {
  CreateRiderAccount,
  DeleteRiderAccount,
  GetRiderProfile,
  LoginRider,
  UpdateRiderAccount,
} from "../controllers/RiderControllers";
import {
  RiderDocumentsUpload,
  getRiderDocuments,
} from "../controllers/RiderDocumentsControllers";
const router: Router = express.Router();
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    //give it a file name
    const name = file.originalname;
    const fileExtension = file.originalname.split(".").pop();

    const newFilename = `${name}.${fileExtension}`;
    cb(null, newFilename);
  },
});

const upload = multer({ storage: storage });

router.post("/create-rider-account", CreateRiderAccount);
router.post("/login-rider", LoginRider);
router.post("/delete-rider-account/:id", DeleteRiderAccount);
router.post(
  "/documents/upload/:id",
  upload.array("images", 6),
  RiderDocumentsUpload
);
router.get("/documents/rider/:id", getRiderDocuments);
router.put("/update-rider-details/:id", UpdateRiderAccount);
router.get("/profile/:id", GetRiderProfile);

export default router;
