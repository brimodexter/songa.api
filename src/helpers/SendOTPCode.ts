// Set your app credentials
const credentials = {
  apiKey: "796f3e115ac2b21f4c9771b074065b3ffc27d891d656b9b8265b735a00d7ead9",
  //apiKey: "0ca4a69a24aed0caa5293247228c8eb0d871b4865c83b0e765863661576ac180",
  username: "sonatest",
};

// Initialize the SDK
const AfricasTalking = require("africastalking")(credentials, {
  timeout: 60000,
});

// Get the SMS service
const sms = AfricasTalking.SMS;

export async function SendOTPCode(otp: number | string) {
  const options = {
    // Set the numbers you want to send to in international format
    to: "+254703605544",
    // Set your message
    message: otp,
    // Set your shortCode or senderId
    //from: "MARTIN_SONGA",
  };

  // That’s it, hit send and we’ll take care of the rest
  await sms
    .send(options)
    .then(console.log)
    .catch((err: any) => console.log(err.message));
}

//sendMessage(56565);
