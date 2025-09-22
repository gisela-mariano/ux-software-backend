import { DatabaseConfigService } from "@/infra/database/databaseConfig.service";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const databaseService = new DatabaseConfigService(configService);
        return databaseService.getTypeOrmConfig();
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
