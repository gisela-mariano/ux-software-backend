import { DatabaseModule } from "@/infra/database/database.module";
import { UsersModule } from "@modules/users/users.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
