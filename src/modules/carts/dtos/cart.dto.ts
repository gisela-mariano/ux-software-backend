import { ProductInDb } from "@modules/products/dtos/product.dto";
import { ApiProperty, IntersectionType } from "@nestjs/swagger";
import { BaseInDbDTO } from "@shared/dtos/base.dto";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateIf,
} from "class-validator";

export class BaseCartDTO {
  @IsNotEmpty({ message: "quantity should not be empty" })
  @IsNumber({}, { message: "quantity must be a number" })
  @Min(1, { message: "quantity must be greater than 0" })
  quantity: number;
}

export class CartInDb extends IntersectionType(BaseCartDTO, BaseInDbDTO) {}

export class CartInDbJoinProduct extends CartInDb {
  product: ProductInDb;
}

export class AddProductToCartDTO {
  @IsNotEmpty({ message: "productId should not be empty" })
  @IsUUID(4, { message: "productId must be a valid uuid" })
  productId: string;

  @ApiProperty({
    description: "Specifies the quantity of products to add to the cart",
  })
  @IsOptional()
  @IsNumber({}, { message: "quantity must be a number" })
  @Min(1, { message: "quantity must be greater than 0" })
  quantity: number;
}

export class RemoveProductFromCartDTO {
  @IsNotEmpty({ message: "productId should not be empty" })
  @IsUUID(4, { message: "productId must be a valid uuid" })
  productId: string;

  @ApiProperty({
    description: "Specifies the quantity of products to remove from the cart",
  })
  @ValidateIf((obj: { all: boolean }) => !obj.all)
  @IsNumber({}, { message: "quantity must be a number" })
  @Min(1, { message: "quantity must be greater than 0" })
  quantity: number;

  @ApiProperty({
    description: "If set to true, all these products will be removed",
  })
  @IsOptional()
  @IsBoolean({ message: "all must be a boolean" })
  all: boolean = false;
}
