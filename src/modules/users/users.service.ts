import { AlreadyRegisteredException } from "@/exceptions";
import { CreateUserDTO, UserInDb, UserInDbResponse, UserRole } from "@modules/users/dtos/user.dto";
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

  async create(createUser: CreateUserDTO): Promise<UserInDbResponse> {
    await this.verifyAlreadyRegisteredByEmail(createUser.email);

    const passwordHash = await hash(createUser.password, 10);

    const user = await this.usersRepository.save({
      ...createUser,
      passwordHash,
    });

    return user;
  }

  async fetchById(id: string, throwError = false): Promise<UserInDbResponse | null> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user && throwError) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async fetchByEmail(
    email: string,
    throwError = false,
    withPassword = false,
  ): Promise<UserInDb | null> {
    const user = withPassword
      ? await this.usersRepository
          .createQueryBuilder("user")
          .addSelect("user.passwordHash")
          .where("user.email = :email", { email })
          .getOne()
      : await this.usersRepository.findOne({ where: { email } });

    if (!user && throwError) {
      throw new NotFoundException(`User with id ${email} not found`);
    }

    return user;
  }

  async updateUserRoles(id: string, roles: UserRole[]): Promise<UserInDbResponse> {
    await this.fetchById(id, true);

    const user = await this.usersRepository.preload({
      id,
      roles,
    });

    const result = await this.usersRepository.save(user!);

    return result;
  }

  private async verifyAlreadyRegisteredByEmail(email: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ email });

    if (user) {
      throw new AlreadyRegisteredException(`User with email ${email} already registered`);
    }
  }
}
