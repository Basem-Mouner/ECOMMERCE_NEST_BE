import { customAlphabet, nanoid } from 'nanoid';

export type OTP = {
  code: string;
  otpExpires: number;
};

export const generateOTP = (
  expireTimeByMin: number = 5,
  otpLength: number = 5,
): OTP => {
  const otp = {
    code: nanoid(otpLength), // Generate a 5-character OTP  or customAlphabet("0123456789",4)
    otpExpires: Date.now() + expireTimeByMin * 60 * 1000, // Expires in 5 minutes
  };
  return otp;
};

//======================================================================
export const generateOTPAlphabet = (
  expireTimeByMin: number = 5,
  otpLength: number = 4,
): OTP => {
  const otp = {
    code: customAlphabet('0123456789', otpLength)(),
    otpExpires: Date.now() + expireTimeByMin * 60 * 1000, // Expires in 5 minutes by default
  };
  return otp;
};
//=========================================================================
