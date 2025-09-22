import { BaseInDbDTO } from "@/shared/dtos/base.dto";
import { strongPasswordRegex } from "@/utils/regex";
import { IntersectionType } from "@nestjs/mapped-types";
import { IsNotEmpty, IsString, Matches } from "class-validator";

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
}

export class UserInDb extends IntersectionType(BaseUserDTO, BaseInDbDTO) {}

export class CreateUserDTO extends BaseUserDTO {
  @IsString({ message: "password must be a string" })
  @IsNotEmpty({ message: "password should not be empty" })
  @Matches(strongPasswordRegex, {
    message:
      "Password must have at least 8 characters, one letter, one number and one special character",
  })
  password: string;
}
