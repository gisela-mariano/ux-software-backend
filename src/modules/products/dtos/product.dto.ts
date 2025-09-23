import { UserInDb } from "@/modules/users/dtos/user.dto";
import { IntersectionType, PartialType } from "@nestjs/swagger";
import { BaseInDbDTO } from "@shared/dtos/base.dto";
import { IsArray, IsNotEmpty, IsNumber, IsString, IsUrl, Min } from "class-validator";

export class BaseProductDTO {
  @IsString({ message: "name must be a string" })
  @IsNotEmpty({ message: "name should not be empty" })
  name: string;

  @IsNumber({}, { message: "price must be a number" })
  @IsNotEmpty({ message: "price should not be empty" })
  @Min(0, { message: "price must be greater than 0" })
  price: number;

  @IsArray({ message: "imageUrls must be an array" })
  @IsUrl({}, { each: true, message: "imageUrls must be a valid url" })
  imageUrls?: string[];

  @IsString({ message: "description must be a string" })
  description?: string;
}

export class ProductInDb extends IntersectionType(BaseProductDTO, BaseInDbDTO) {}

export class CreateProductDTO extends BaseProductDTO {}

export class SaveProductInDbDTO extends BaseProductDTO {
  user: UserInDb;
}

export class UpdateProductDTO extends PartialType(CreateProductDTO) {}

export class ProductInJoinUserDb extends IntersectionType(BaseProductDTO, BaseInDbDTO) {
  user: UserInDb;
}
