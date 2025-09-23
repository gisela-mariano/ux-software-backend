import {
  ApiCreatedResponseWrapped,
  ApiSuccessResponseWrapped,
} from "@/shared/decorators/apiResponse.decorator";
import { Public } from "@/shared/decorators/isPublic.decorator";
import type { TokenBuffer } from "@modules/auth/interfaces/auth.interface";
import { CreateUserDTO, UpdateUseRolesDTO, UserInDbResponse } from "@modules/users/dtos/user.dto";
import { UsersService } from "@modules/users/users.service";
import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiHeader } from "@nestjs/swagger";
import { CurrentUser } from "@shared/decorators/currentUser.decorator";

@Controller("users")
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiCreatedResponseWrapped(UserInDbResponse)
  @Public()
  @Post()
  async create(@Body() payload: CreateUserDTO) {
    const data = await this.userService.create(payload);

    return {
      message: "User successfully created",
      data,
    };
  }

  @ApiHeader({ name: "Authorization", required: true })
  @ApiSuccessResponseWrapped(UserInDbResponse)
  @Get("/:id")
  async getById(@Param("id") id: string) {
    const data = await this.userService.fetchById(id);

    return {
      message: "User successfully obtained",
      data,
    };
  }

  @ApiHeader({ name: "Authorization", required: true })
  @ApiSuccessResponseWrapped(UserInDbResponse)
  @Patch()
  async updateRoles(@CurrentUser() user: TokenBuffer, @Body() payload: UpdateUseRolesDTO) {
    const data = await this.userService.updateUserRoles(user.sub, payload.roles);

    return {
      message: "User roles successfully updated",
      data,
    };
  }
}
