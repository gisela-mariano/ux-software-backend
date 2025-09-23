import { AlreadyRegisteredException } from "@/exceptions";
import { PaginationDTO } from "@/shared/dtos/routeParams.dto";
import { DefaultPagination } from "@/shared/interfaces/routeParams.interface";
import {
  AddProductToCartDTO,
  CartInDb,
  CartInDbJoinProduct,
  RemoveProductFromCartDTO,
} from "@modules/carts/dtos/cart.dto";
import { CartEntity } from "@modules/carts/entities/cart.entity";
import { ProductsService } from "@modules/products/products.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    private readonly productService: ProductsService,
  ) {}

  async addProduct(cartProduct: AddProductToCartDTO, userId: string): Promise<CartInDb> {
    await Promise.all([
      this.productService.fetchById(cartProduct.productId, true),
      this.verifyIfProductIsAlreadyAdded(cartProduct.productId, userId),
    ]);

    const result = await this.cartRepository.save({
      ...cartProduct,
      user: { id: userId },
      product: { id: cartProduct.productId },
    });

    return result;
  }

  async listUserCart(userId: string, queryParams?: PaginationDTO): Promise<CartInDbJoinProduct[]> {
    const { limit = DefaultPagination.LIMIT, page = DefaultPagination.PAGE } = queryParams ?? {};

    const carts = await this.cartRepository.find({
      where: { user: { id: userId } },
      relations: { product: true },
      skip: page * limit,
      take: limit,
    });

    return carts;
  }

  async updateProductQuantity(product: AddProductToCartDTO, userId: string): Promise<CartInDb> {
    const cartProduct = await this.verifyUserHasProductInCart(product.productId, userId);

    const updatedCartProduct = await this.cartRepository.preload({
      id: cartProduct.id,
      quantity: product.quantity,
    });

    const result = await this.cartRepository.save(updatedCartProduct!);

    return result;
  }

  async removeProduct(payload: RemoveProductFromCartDTO, userId: string): Promise<boolean> {
    const { productId, quantity, all } = payload;

    const cartProduct = await this.verifyUserHasProductInCart(productId, userId);

    const newQuantity = cartProduct.quantity - quantity;

    if (all || newQuantity <= 0) {
      const result = await this.cartRepository.delete({
        user: { id: userId },
        product: { id: productId },
      });

      return result.affected === 1;
    }

    const result = await this.cartRepository.update(
      { id: cartProduct.id },
      {
        quantity: newQuantity,
      },
    );

    return result.affected === 1;
  }

  private async verifyIfProductIsAlreadyAdded(productId: string, userId: string): Promise<void> {
    const product = await this.cartRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (product) throw new AlreadyRegisteredException(`Product with id ${productId} already added`);
  }

  private async verifyUserHasProductInCart(productId: string, userId: string): Promise<CartInDb> {
    const product = await this.cartRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (!product)
      throw new NotFoundException(`Product with id ${productId} not found for user ${userId}`);

    return product;
  }
}
