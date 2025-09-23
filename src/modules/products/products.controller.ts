import {
  ApiCreatedResponseWrapped,
  ApiSuccessResponseWrapped,
} from "@/shared/decorators/apiResponse.decorator";
import { Public } from "@/shared/decorators/isPublic.decorator";
import { Roles } from "@/shared/decorators/roles.decorator";
import { PaginationDTO } from "@/shared/dtos/routeParams.dto";
import { PermissionGuard } from "@/shared/guards/permission.guard";
import type { TokenBuffer } from "@modules/auth/interfaces/auth.interface";
import {
  CreateProductDTO,
  ProductInDb,
  ProductInDbJoinUser,
  UpdateProductDTO,
} from "@modules/products/dtos/product.dto";
import { ProductsService } from "@modules/products/products.service";
import { UserRole } from "@modules/users/dtos/user.dto";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiHeader } from "@nestjs/swagger";
import { CurrentUser } from "@shared/decorators/currentUser.decorator";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiBody({ type: [CreateProductDTO] })
  @ApiHeader({ name: "Authorization", required: true })
  @ApiCreatedResponseWrapped(ProductInDb)
  @Roles(UserRole.ADMIN)
  @UseGuards(PermissionGuard)
  @Post()
  async create(@CurrentUser() user: TokenBuffer, @Body() payload: CreateProductDTO[]) {
    const data = await this.productsService.create(payload, user.sub);

    return {
      message: "Product successfully created",
      data,
    };
  }

  @ApiSuccessResponseWrapped(ProductInDbJoinUser)
  @Public()
  @Get("/:id")
  async getById(@Param("id") id: string) {
    const data = await this.productsService.fetchById(id);

    return {
      message: "Product successfully obtained",
      data,
    };
  }

  @ApiSuccessResponseWrapped([ProductInDbJoinUser])
  @Public()
  @Get()
  async getAll(@Query() params: PaginationDTO) {
    const data = await this.productsService.fetchAll(params);

    return {
      message: "Products successfully obtained",
      data,
    };
  }

  @ApiHeader({ name: "Authorization", required: true })
  @ApiSuccessResponseWrapped(ProductInDb)
  @Roles(UserRole.ADMIN)
  @UseGuards(PermissionGuard)
  @Patch("/:id")
  async update(
    @CurrentUser() user: TokenBuffer,
    @Param("id") id: string,
    @Body() payload: UpdateProductDTO,
  ) {
    const data = await this.productsService.update(id, payload, user.sub);

    return {
      message: "Product successfully updated",
      data,
    };
  }

  @ApiHeader({ name: "Authorization", required: true })
  @ApiSuccessResponseWrapped(Boolean)
  @Roles(UserRole.ADMIN)
  @UseGuards(PermissionGuard)
  @Delete("/:id")
  async delete(@CurrentUser() user: TokenBuffer, @Param("id") id: string) {
    const data = await this.productsService.delete(id, user.sub);

    return {
      message: "Product successfully deleted",
      data,
    };
  }
}
