import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env.example') });
// Set your app credentials
const credentials = {
  apiKey: process.env.AFRICASTALKING_APIKEY,
  username: process.env.AFRICASTALKING_USERNAME,
};

// Initialize the SDK
const AfricasTalking = require('africastalking')(credentials, {
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
    // Set your shortCode or senderId- you create an alphanumeric or send code on the africas talking dashboard

    //from: process.env.AFRICASTALKING_ALPHANUMERIC,
  };

  await sms.send(options).catch((err: any) => {
    throw err;
  });
}
