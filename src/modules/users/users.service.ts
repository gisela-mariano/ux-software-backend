import { AlreadyRegisteredException } from "@/exceptions";
import { CreateUserDTO, UserInDb } from "@modules/users/dtos/user.dto";
import { UserEntity } from "@modules/users/entities/user.entity";
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { hash } from "bcrypt";
import { Repository } from "typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(createUser: CreateUserDTO): Promise<UserInDb> {
    await this.verifyAlreadyRegisteredByEmail(createUser.email);

    const passwordHash = await hash(createUser.password, 10);

    const user = await this.usersRepository.save({
      ...createUser,
      passwordHash,
    });

    return this.dataToUserResponse(user);
  }

  async fetchById(id: string, throwError = false): Promise<UserInDb | null> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user && throwError) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async verifyAlreadyRegisteredByEmail(email: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ email });

    if (user) {
      throw new AlreadyRegisteredException(`User with email ${email} already registered`);
    }
  }

  private dataToUserResponse(data: UserEntity): UserInDb {
    const user: { password?: string; passwordHash?: string } = data;

    if (user.password) delete user.password;
    if (user.passwordHash) delete user.passwordHash;

    return user as unknown as UserInDb;
  }
}
