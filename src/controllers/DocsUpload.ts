import { PrismaClient } from '@prisma/client';
//import { checkRider } from "../helpers/user";
import { Response, Request } from 'express';
const prisma = new PrismaClient();
//takes in an array of documents with the document name and the link in base64 format

const images = [
  {
    link: 'https://i.pinimg.com/236x/f7/00/da/f700da5beddbe1737f30fa6520d78330.jpg',
    docName: 'birth-cert',
  },
  {
    link: 'https://i.pinimg.com/236x/12/2a/ee/122aee9a6fd21cfeee9f65518a46e21b.jpg',
    docName: 'good conduct',
  },
  {
    link: 'https://i.pinimg.com/474x/e2/43/e3/e243e3c9ff79181e51838aa7a6c3a58a.jpg',
    docName: 'ID-front',
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
  res.send('documents controllers');
  //check whether they have docs
  //await prisma.riderDocuments.create;
};
