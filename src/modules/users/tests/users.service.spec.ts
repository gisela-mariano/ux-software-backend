/* eslint-disable @typescript-eslint/unbound-method */
import { AlreadyRegisteredException } from "@/exceptions";
import { OtpService } from "@/infra/otp/otp.service";
import { UserRole } from "@modules/users/dtos/user.dto";
import { UserEntity } from "@modules/users/entities/user.entity";
import { UsersService } from "@modules/users/users.service";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { hash } from "bcrypt";
import { Repository } from "typeorm";

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashedPassword"),
}));

describe("UsersService", () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<Repository<UserEntity>>;
  let otpService: jest.Mocked<OtpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            preload: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: OtpService,
          useValue: {
            sendOtp: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(getRepositoryToken(UserEntity));
    otpService = module.get(OtpService);
  });

  describe("create", () => {
    it("should create a new user and send OTP", async () => {
      usersRepository.findOneBy.mockResolvedValue(null);
      usersRepository.save.mockResolvedValue({
        id: "1",
        name: "Test",
        email: "test@example.com",
      } as UserEntity);

      const result = await service.create({
        name: "Test",
        email: "test@example.com",
        password: "123456",
      });

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(hash).toHaveBeenCalledWith("123456", 10);
      expect(usersRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ email: "test@example.com", passwordHash: "hashedPassword" }),
      );
      expect(otpService.sendOtp).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "Test",
      });
      expect(result).toEqual(expect.objectContaining({ email: "test@example.com" }));
    });

    it("should throw AlreadyRegisteredException if user with email already exists", async () => {
      usersRepository.findOneBy.mockResolvedValue({ id: "1" } as UserEntity);

      await expect(
        service.create({
          name: "Test",
          email: "test@example.com",
          password: "123456",
        }),
      ).rejects.toThrow(AlreadyRegisteredException);
    });
  });

  describe("fetchById", () => {
    it("should return a user by id", async () => {
      usersRepository.findOneBy.mockResolvedValue({
        id: "1",
        email: "test@example.com",
      } as UserEntity);

      const result = await service.fetchById("1");

      expect(result).toEqual(expect.objectContaining({ email: "test@example.com" }));
    });

    it("should throw NotFoundException when no user is found and throwError = true", async () => {
      usersRepository.findOneBy.mockResolvedValue(null);

      await expect(service.fetchById("1", true)).rejects.toThrow(NotFoundException);
    });
  });

  describe("fetchByEmail", () => {
    it("should return a user without password", async () => {
      usersRepository.findOne.mockResolvedValue({
        id: "1",
        email: "test@example.com",
      } as UserEntity);

      const result = await service.fetchByEmail("test@example.com");

      expect(result).toEqual(expect.objectContaining({ email: "test@example.com" }));
    });

    it("should return a user with password when withPassword = true", async () => {
      const qb = {
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: "1",
          email: "test@example.com",
          passwordHash: "hashedPassword",
        }),
      };

      (usersRepository.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.fetchByEmail("test@example.com", false, true);

      expect(qb.where).toHaveBeenCalledWith("user.email = :email", { email: "test@example.com" });
      expect(result).toEqual(
        expect.objectContaining({ email: "test@example.com", passwordHash: "hashedPassword" }),
      );
    });

    it("should throw NotFoundException no user is found and throwError = true", async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.fetchByEmail("test@example.com", true)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("updateUserRoles", () => {
    it("should update user roles", async () => {
      jest.spyOn(service, "fetchById").mockResolvedValue({ id: "1" } as UserEntity);
      usersRepository.preload.mockResolvedValue({ id: "1", roles: [UserRole.ADMIN] } as UserEntity);
      usersRepository.save.mockResolvedValue({ id: "1", roles: [UserRole.ADMIN] } as UserEntity);

      const result = await service.updateUserRoles("1", [UserRole.ADMIN]);

      expect(usersRepository.preload).toHaveBeenCalledWith({ id: "1", roles: [UserRole.ADMIN] });
      expect(result).toEqual(expect.objectContaining({ roles: [UserRole.ADMIN] }));
    });
  });
});
