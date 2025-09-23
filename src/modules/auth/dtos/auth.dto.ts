import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDTO {
  @IsString({ message: "email must be a string" })
  @IsEmail({}, { message: "Invalid email" })
  @IsNotEmpty({ message: "email is required" })
  email: string;

  @IsString({ message: "password must be a string" })
  @IsNotEmpty({ message: "password is required" })
  password: string;
}

export class LoginResponseDTO {
  accessToken: string;
}
