import { CreateUserDTO } from "@modules/users/dtos/user.dto";
import { UsersService } from "@modules/users/users.service";
import { Body, Controller, Get, Param, Post } from "@nestjs/common";

@Controller("users")
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async create(@Body() payload: CreateUserDTO) {
    const data = await this.userService.create(payload);

    return {
      success: true,
      data,
    };
  }

  @Get("/:id")
  async getById(@Param("id") id: string) {
    const data = await this.userService.fetchById(id);

    return {
      message: "User successfully obtained",
      data,
    };
  }
}
