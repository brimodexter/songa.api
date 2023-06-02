import cloudinary from "cloudinary";
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, "../../.env.example") });

//create a cloudinary account using songa credentials and change here.
const options = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_APIKEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};
//console.log(options);

cloudinary.v2.config(options);

interface uploadProps {
  username: string;
  userId: string;
  image: string;
  docName: string;
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

    console.log(`${docName}: ${secureUrl}`);

    return { docName: docName, link: secureUrl };
  } catch (err) {
    console.log(err);
    
    throw err;
  }
}
// const images = [
//   {
//     link: "https://i.pinimg.com/236x/f7/00/da/f700da5beddbe1737f30fa6520d78330.jpg",
//     docName: "birth-cert",
//   },
//   {
//     link: "https://i.pinimg.com/236x/12/2a/ee/122aee9a6fd21cfeee9f65518a46e21b.jpg",
//     docName: "good conduct",
//   },
//   {
//     link: "https://i.pinimg.com/474x/e2/43/e3/e243e3c9ff79181e51838aa7a6c3a58a.jpg",
//     docName: "ID-front",
//   },
// ];

// images.forEach((image) => {
//   UploadToCloudinary({
//     username: "Kelovin",
//     userId: "f0ac57bd-6a27-4b70-8a73-fb60865dc0a9",
//     image: image.link,
//     docName: image.docName,
//   }).catch(err=>console.log(err.message)
//   )
// });
