import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.example') });

//create a cloudinary account using songa credentials and change here.
const options = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};


cloudinary.v2.config(options);

interface uploadProps {
  username: string;
  userId: string;
  image: string;
  docName: string;
}
export interface UploadResult{
  docName: string,
  link: string
}
//takes in the image in base 64 string format
export async function UploadToCloudinary({
  username,
  userId,
  image,
  docName,
}: uploadProps) {
  try {
    const folderName = `${username}--${userId}`;
    const fileName = `${username}--${userId}--${docName}`;

    const res = await cloudinary.v2.uploader.upload(image, {
      public_id: `${username} -- ${docName}`,
      folder: `Songa-dev/Riders/${folderName}`,
    });
    const secureUrl = await res.secure_url;
    return { docName: docName, link: secureUrl } as UploadResult;
  } catch (err) {
     throw err;
  }
}

