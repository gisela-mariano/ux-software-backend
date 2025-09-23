import { AuthController } from "@modules/auth/auth.controller";
import { AuthService } from "@modules/auth/auth.service";
import { UsersModule } from "@modules/users/users.module";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>("SECRET_KEY");

        if (!secret) throw new Error(`Config error - missing env.SECRET_KEY`);

        return {
          secret,
          signOptions: { expiresIn: configService.get<string>("TOKEN_EXPIRATION") ?? "1h" },
        };
      },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
