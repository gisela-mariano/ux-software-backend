import { DatabaseModule } from "@/infra/database/database.module";
import { JwtAuthGuard } from "@/modules/auth/guards/jwtAuth.guard";
import { AuthModule } from "@modules/auth/auth.module";
import { ProductsModule } from "@modules/products/products.module";
import { UsersModule } from "@modules/users/users.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import path from "path";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: path.resolve(__dirname, "../.env") }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ProductsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtService,
  ],
})
export class AppModule {}
