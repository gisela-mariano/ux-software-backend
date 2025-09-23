import { BaseInDbDTO } from "@/shared/dtos/base.dto";
import { strongPasswordRegex } from "@/utils/regex";
import { ApiProperty, IntersectionType, OmitType } from "@nestjs/swagger";
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
} from "class-validator";

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
  @IsEmail({}, { message: "email must be a valid email" })
  email: string;

  @IsArray({ message: "roles must be an array" })
  @IsNotEmpty({ message: "roles should not be empty" })
  @ArrayNotEmpty({ message: "roles array should not be empty" })
  roles: UserRole[];
}

export class UserInDb extends IntersectionType(BaseUserDTO, BaseInDbDTO) {
  passwordHash: string;
}

export class UserInDbResponse extends OmitType(UserInDb, ["passwordHash"] as const) {}

export class CreateUserDTO extends OmitType(BaseUserDTO, ["roles"] as const) {
  @ApiProperty({
    description:
      "Password must have at least 8 characters, one letter, one number and one special character",
  })
  @IsString({ message: "password must be a string" })
  @IsNotEmpty({ message: "password should not be empty" })
  @Matches(strongPasswordRegex, {
    message:
      "Password must have at least 8 characters, one letter, one number and one special character",
  })
  password: string;
}

export class UpdateUseRolesDTO {
  @IsArray({ message: "roles must be an array" })
  @IsNotEmpty({ message: "roles should not be empty" })
  @ArrayNotEmpty({ message: "roles array should not be empty" })
  @IsEnum(UserRole, { each: true, message: "roles must be a valid enum" })
  roles: UserRole[];
}
