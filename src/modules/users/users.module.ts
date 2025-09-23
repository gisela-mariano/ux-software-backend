import { UserEntity } from "@modules/users/entities/user.entity";
import { UsersController } from "@modules/users/users.controller";
import { UsersService } from "@modules/users/users.service";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
