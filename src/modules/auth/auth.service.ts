import { LoginDTO, LoginResponseDTO } from "@modules/auth/dtos/auth.dto";
import { TokenBuffer } from "@modules/auth/interfaces/auth.interface";
import { UsersService } from "@modules/users/users.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login({ email, password }: LoginDTO): Promise<LoginResponseDTO> {
    const user = await this.userService.fetchByEmail(email);

    if (!user) throw new UnauthorizedException("Invalid credentials");

    const isMatch = await compare(password, user.passwordHash);

    if (!isMatch) throw new UnauthorizedException("Invalid credentials");

    const payload: TokenBuffer = { sub: user.id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
