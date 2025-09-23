import { ProductEntity } from "@modules/products/entities/product.entity";
import { ProductsController } from "@modules/products/products.controller";
import { ProductsService } from "@modules/products/products.service";
import { UsersModule } from "@modules/users/users.module";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), UsersModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
