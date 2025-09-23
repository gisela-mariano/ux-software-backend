import { Public } from "@/shared/decorators/isPublic.decorator";
import { AuthService } from "@modules/auth/auth.service";
import { LoginDto } from "@modules/auth/dtos/auth.dto";
import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post("login")
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }
}
