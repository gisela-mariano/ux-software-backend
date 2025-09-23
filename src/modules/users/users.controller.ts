import {
  ApiCreatedResponseWrapped,
  ApiSuccessResponseWrapped,
} from "@/shared/decorators/apiResponse.decorator";
import { Public } from "@/shared/decorators/isPublic.decorator";
import { CreateUserDTO, UserInDbResponse } from "@modules/users/dtos/user.dto";
import { UsersService } from "@modules/users/users.service";
import { Body, Controller, Get, Param, Post } from "@nestjs/common";

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

  @ApiSuccessResponseWrapped(UserInDbResponse)
  @Get("/:id")
  async getById(@Param("id") id: string) {
    const data = await this.userService.fetchById(id);

    return {
      message: "User successfully obtained",
      data,
    };
  }
}
