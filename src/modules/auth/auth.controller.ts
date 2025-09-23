import { ApiSuccessResponseWrapped } from "@/shared/decorators/apiResponse.decorator";
import { Public } from "@/shared/decorators/isPublic.decorator";
import { AuthService } from "@modules/auth/auth.service";
import { LoginDTO, LoginResponseDTO } from "@modules/auth/dtos/auth.dto";
import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiSuccessResponseWrapped(LoginResponseDTO)
  @HttpCode(HttpStatus.OK)
  @Public()
  @Post("login")
  login(@Body() payload: LoginDTO) {
    return this.authService.login(payload);
  }
}
