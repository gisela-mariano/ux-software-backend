import {
  ApiCreatedResponseWrapped,
  ApiSuccessResponseWrapped,
} from "@/shared/decorators/apiResponse.decorator";
import { CurrentUser } from "@/shared/decorators/currentUser.decorator";
import { PaginationDTO } from "@/shared/dtos/routeParams.dto";
import type { TokenBuffer } from "@modules/auth/interfaces/auth.interface";
import { CartsService } from "@modules/carts/carts.service";
import {
  AddProductToCartDTO,
  CartInDb,
  CartInDbJoinProduct,
  RemoveProductFromCartDTO,
} from "@modules/carts/dtos/cart.dto";
import { Body, Controller, Get, Patch, Post, Query } from "@nestjs/common";
import { ApiHeader } from "@nestjs/swagger";

@Controller("carts")
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @ApiHeader({ name: "Authorization", required: true })
  @ApiCreatedResponseWrapped(CartInDb)
  @Post()
  async addProduct(@CurrentUser() user: TokenBuffer, @Body() payload: AddProductToCartDTO) {
    const data = await this.cartsService.addProduct(payload, user.sub);

    return {
      message: "Product successfully added to cart",
      data,
    };
  }

  @ApiHeader({ name: "Authorization", required: true })
  @ApiSuccessResponseWrapped([CartInDbJoinProduct])
  @Get()
  async listUserCart(@CurrentUser() user: TokenBuffer, @Query() params: PaginationDTO) {
    const data = await this.cartsService.listUserCart(user.sub, params);

    return {
      message: "Cart successfully obtained",
      data,
    };
  }

  @ApiHeader({ name: "Authorization", required: true })
  @ApiSuccessResponseWrapped(CartInDb)
  @Patch()
  async updateQuantity(@CurrentUser() user: TokenBuffer, @Body() payload: AddProductToCartDTO) {
    const data = await this.cartsService.updateProductQuantity(payload, user.sub);

    return {
      message: "Product quantity successfully changed",
      data,
    };
  }

  @ApiHeader({ name: "Authorization", required: true })
  @ApiSuccessResponseWrapped(CartInDb)
  @Patch("/remove")
  async removeProduct(@CurrentUser() user: TokenBuffer, @Body() payload: RemoveProductFromCartDTO) {
    const data = await this.cartsService.removeProduct(payload, user.sub);

    return {
      message: "Product(s) successfully removed from cart",
      data,
    };
  }
}
