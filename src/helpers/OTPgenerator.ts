import otpGenerator from 'otp-generator';
export const OTPGenerator = async (): Promise<string> => {
  const otp: string = await otpGenerator.generate(4, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  return otp;
};
