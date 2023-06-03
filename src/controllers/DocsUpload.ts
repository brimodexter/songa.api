import { PrismaClient } from "@prisma/client";
//import { checkRider } from "../helpers/user";
import { Response, Request } from "express";
import { checkRider } from "../helpers/user";
import { UploadToCloudinary } from "../helpers/Cloudinary";
const prisma = new PrismaClient();

//takes in an array of documents with the document name and the link in base64 format
const images = [
  {
    link: "https://i.pinimg.com/236x/f7/00/da/f700da5beddbe1737f30fa6520d78330.jpg",
    docName: "birth-cert",
  },
  {
    link: "https://i.pinimg.com/236x/12/2a/ee/122aee9a6fd21cfeee9f65518a46e21b.jpg",
    docName: "good conduct",
  },
  {
    link: "https://i.pinimg.com/474x/e2/43/e3/e243e3c9ff79181e51838aa7a6c3a58a.jpg",
    docName: "ID-front",
  },
];
interface Image {
  docName: string;
  imageLink: string;
}
interface Props {
  riderID: string;
  images: Image[];
}
export const RiderDocumentsUpload = async (req: Request, res: Response) => {
  try {
    const images = req.files;
    console.log(images, "images", typeof images);
    
    const { id } = req.params;
    console.log(id);
    //check rider
    const riderExists = await checkRider({ id });
    if (!riderExists?.riderPresent) {
      res.status(401).json({ message: "rider does not exist" });
      return;
    }
    const rider = riderExists.rider;
    
    //images?.forEach(img=> console.log(img.filename)
    
    //upload image to cloudinary
    if(Array.isArray(images)){
      console.log("array");
      
      images?.forEach((image: Express.Multer.File)=>{
        const parts= image.originalname.split(".");
        const docName= parts[0]
        console.log(docName);
        
        UploadToCloudinary({
          username: `${rider?.first_name} ${rider?.last_name}`,
          image: image.path,
          userId: rider!.id,
          docName: docName
        })
      })
    } else {
      console.log("not arrays");
      
    }
  
    images ? res.send("documents controllers"): res.send("no images sir");
  } catch (err: any) {
    console.log(err.message);
  }

  //check whether they have docs
  //await prisma.riderDocuments.create;
};
