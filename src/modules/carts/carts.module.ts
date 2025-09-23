import { CartsController } from "@modules/carts/carts.controller";
import { CartsService } from "@modules/carts/carts.service";
import { CartEntity } from "@modules/carts/entities/cart.entity";
import { ProductsModule } from "@modules/products/products.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([CartEntity]), ProductsModule],
  providers: [CartsService],
  controllers: [CartsController],
})
export class CartsModule {}
