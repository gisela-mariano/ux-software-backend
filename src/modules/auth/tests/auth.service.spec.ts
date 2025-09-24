/* eslint-disable @typescript-eslint/unbound-method */
import { UserInDb } from "@/modules/users/dtos/user.dto";
import { AuthService } from "@modules/auth/auth.service";
import { UsersService } from "@modules/users/users.service";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { compare } from "bcrypt";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));

describe("AuthService", () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            fetchByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe("login", () => {
    it("should return accessToken when credentials are valid", async () => {
      usersService.fetchByEmail.mockResolvedValue({
        id: "u1",
        email: "john@example.com",
        roles: ["USER"],
        passwordHash: "hashed",
      } as unknown as UserInDb);

      (compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue("signed.jwt.token");

      const result = await service.login({ email: "john@example.com", password: "secret" });

      expect(usersService.fetchByEmail).toHaveBeenCalledWith("john@example.com", false, true);
      expect(compare).toHaveBeenCalledWith("secret", "hashed");
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: "u1",
        email: "john@example.com",
        roles: ["USER"],
      });
      expect(result).toEqual({ accessToken: "signed.jwt.token" });
    });

    it("should throw UnauthorizedException when user not found", async () => {
      usersService.fetchByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: "john@example.com", password: "secret" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when password does not match", async () => {
      usersService.fetchByEmail.mockResolvedValue({
        id: "u1",
        email: "john@example.com",
        roles: ["USER"],
        passwordHash: "hashed",
      } as unknown as UserInDb);

      (compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: "john@example.com", password: "wrong" })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
