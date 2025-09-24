import { DatabaseModule } from "@/infra/database/database.module";
import { EmailerModule } from "@/infra/emailer/emailer.module";
import { BullQueueNames } from "@/infra/emailer/interfaces/emailer.interface";
import { OtpController } from "@/infra/otp/otp.controller";
import { OtpModule } from "@/infra/otp/otp.module";
import { OtpService } from "@/infra/otp/otp.service";
import { RedisConfigService } from "@/infra/redis/redisConfig.service";
import { JwtAuthGuard } from "@/modules/auth/guards/jwtAuth.guard";
import { AuthModule } from "@modules/auth/auth.module";
import { CartsModule } from "@modules/carts/carts.module";
import { ProductsModule } from "@modules/products/products.module";
import { UsersModule } from "@modules/users/users.module";
import { RedisModule } from "@nestjs-modules/ioredis";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import path from "path";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: path.resolve(process.cwd(), "./.env") }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisService = new RedisConfigService(config);
        const { host, port, maxRetriesPerRequest } = redisService.getRedisData();

        return {
          redis: {
            host,
            port,
            maxRetriesPerRequest,
          },
        };
      },
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisService = new RedisConfigService(config);
        const { type, url } = redisService.getRedisData();

        return { type, url };
      },
    }),

    BullModule.registerQueue({ name: BullQueueNames.SEND_OTP_EMAIL }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    CartsModule,
    EmailerModule,
    OtpModule,
  ],
  controllers: [OtpController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtService,
    OtpService,
  ],
})
export class AppModule {}
