import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env.example") });
console.log(path.resolve(__dirname, "../../.env.example"));

// Set your app credentials
const credentials = {
  apiKey: process.env.AFRICASTALKINGAPIKEY,
  //apiKey: "0ca4a69a24aed0caa5293247228c8eb0d871b4865c83b0e765863661576ac180",
  username: process.env.AFRICASTALKINGUSERNAME,
};
console.log(credentials);


// Initialize the SDK
const AfricasTalking = require("africastalking")(credentials, {
  timeout: 60000,
});

// Get the SMS service
const sms = AfricasTalking.SMS;
interface OTPProps {
  otpCode: string | number;
  number: string | number;
}

export async function SendOTPCode({ otpCode, number }: OTPProps) {
  const options = {
    // Set the numbers you want to send to in international format
    to: number,
    // Set your message
    message: `This is the code from Songa app ${otpCode}`,
    // Set your shortCode or senderId
    //from: "MARTIN_SONGA",
  };

  // That’s it, hit send and we’ll take care of the rest
  await sms
    .send(options)
    .then(console.log)
    .catch((err: any) => console.log(err.message));
}
SendOTPCode({ otpCode: "3435", number: "+254703605544" });
