import { PaginationDTO } from "@/shared/dtos/routeParams.dto";
import { DefaultPagination } from "@/shared/interfaces/routeParams.interface";
import {
  CreateProductDTO,
  ProductInDb,
  ProductInDbJoinUser,
  UpdateProductDTO,
} from "@modules/products/dtos/product.dto";
import { ProductEntity } from "@modules/products/entities/product.entity";
import { UsersService } from "@modules/users/users.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    product: CreateProductDTO | CreateProductDTO[],
    userId: string,
  ): Promise<ProductInDb | ProductInDb[]> {
    await this.usersService.fetchById(userId, true);

    if (Array.isArray(product)) {
      const payloads = product.map((p) => ({
        ...p,
        user: { id: userId },
      }));
      return this.productsRepository.save(payloads);
    }

    const payload = { ...product, user: { id: userId } };
    return this.productsRepository.save(payload);
  }

  async fetchById(id: string, throwError = false): Promise<ProductInDbJoinUser | null> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!product && throwError) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return product;
  }

  async fetchAll(params?: PaginationDTO): Promise<ProductInDbJoinUser[]> {
    const { limit = DefaultPagination.LIMIT, page = DefaultPagination.PAGE } = params ?? {};

    const products = await this.productsRepository.find({
      relations: {
        user: true,
      },
      skip: page * limit,
      take: limit,
    });

    return products;
  }

  async update(id: string, product: UpdateProductDTO, userId: string): Promise<ProductInDb> {
    await this.verifyIsUserProduct(id, userId);

    const updatedProduct = await this.productsRepository.preload({
      id,
      user: { id: userId },
      ...product,
    });

    const result = await this.productsRepository.save(updatedProduct!);

    return result;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.productsRepository.delete({ id, user: { id: userId } });

    return result.affected === 1;
  }

  private async verifyIsUserProduct(id: string, userId: string): Promise<ProductInDb> {
    const product = await this.productsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!product) throw new NotFoundException(`Product with id ${id} not found for user ${userId}`);

    return product;
  }
}
