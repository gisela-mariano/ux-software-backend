import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class VerifyOtpDTO {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
