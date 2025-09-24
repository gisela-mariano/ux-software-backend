export enum BullQueueNames {
  SEND_OTP_EMAIL = "SEND_OTP_EMAIL",
}

export type SendOtpEmailHandler = {
  name: string;
  email: string;
  otp: string;
  expiresIn: number;
};
