import { BaseInDbDTO } from "@/shared/dtos/base.dto";
import { strongPasswordRegex } from "@/utils/regex";
import { IntersectionType, OmitType } from "@nestjs/mapped-types";
import { IsArray, IsNotEmpty, IsString, Matches } from "class-validator";

export enum UserRole {
  ADMIN = "admin",
  CLIENT = "client",
}

export class BaseUserDTO {
  @IsString({ message: "name must be a string" })
  @IsNotEmpty({ message: "name should not be empty" })
  name: string;

  @IsString({ message: "email must be a string" })
  @IsNotEmpty({ message: "email should not be empty" })
  email: string;

  @IsArray({ message: "role must be an array" })
  @IsNotEmpty({ message: "role should not be empty" })
  role: UserRole[];
}

export class UserInDb extends IntersectionType(BaseUserDTO, BaseInDbDTO) {
  passwordHash: string;
}

export class CreateUserDTO extends OmitType(BaseUserDTO, ["role"] as const) {
  @IsString({ message: "password must be a string" })
  @IsNotEmpty({ message: "password should not be empty" })
  @Matches(strongPasswordRegex, {
    message:
      "Password must have at least 8 characters, one letter, one number and one special character",
  })
  password: string;
}
