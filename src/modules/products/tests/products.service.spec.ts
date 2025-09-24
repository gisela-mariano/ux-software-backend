/* eslint-disable @typescript-eslint/unbound-method */
import { UserInDbResponse } from "@/modules/users/dtos/user.dto";
import { DefaultPagination } from "@/shared/interfaces/routeParams.interface";
import { CreateProductDTO, UpdateProductDTO } from "@modules/products/dtos/product.dto";
import { ProductEntity } from "@modules/products/entities/product.entity";
import { ProductsService } from "@modules/products/products.service";
import { UsersService } from "@modules/users/users.service";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";

describe("ProductsService", () => {
  let service: ProductsService;
  let productsRepository: jest.Mocked<Repository<ProductEntity>>;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            preload: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            fetchById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productsRepository = module.get(getRepositoryToken(ProductEntity));
    usersService = module.get(UsersService);
  });

  describe("create", () => {
    it("should create a unique product and associate it with the user", async () => {
      usersService.fetchById.mockResolvedValue({ id: "user-1" } as UserInDbResponse);
      productsRepository.save.mockResolvedValue({
        id: "p1",
        name: "Prod 1",
        price: 10,
        user: { id: "user-1" },
      } as ProductEntity);

      const payload: CreateProductDTO = {
        name: "Prod 1",
        price: 10,
        imageUrls: ["https://img.com/1.png"],
        description: "desc",
      };

      const result = await service.create(payload, "user-1");

      expect(usersService.fetchById).toHaveBeenCalledWith("user-1", true);
      expect(productsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Prod 1",
          price: 10,
          user: { id: "user-1" },
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({ id: "p1", name: "Prod 1", user: { id: "user-1" } }),
      );
    });

    it("should create several products (array) and associate them with the user", async () => {
      usersService.fetchById.mockResolvedValue({ id: "user-1" } as UserInDbResponse);
      productsRepository.save.mockResolvedValue([
        { id: "p1", name: "A", price: 10, user: { id: "user-1" } },
        { id: "p2", name: "B", price: 20, user: { id: "user-1" } },
      ] as unknown as ProductEntity);

      const payload: CreateProductDTO[] = [
        { name: "A", price: 10, imageUrls: [], description: "a" },
        { name: "B", price: 20, imageUrls: [], description: "b" },
      ];

      const result = await service.create(payload, "user-1");

      expect(usersService.fetchById).toHaveBeenCalledWith("user-1", true);
      expect(productsRepository.save).toHaveBeenCalledWith([
        expect.objectContaining({ name: "A", user: { id: "user-1" } }),
        expect.objectContaining({ name: "B", user: { id: "user-1" } }),
      ]);
      expect(result).toHaveLength(2);
    });
  });

  describe("fetchById", () => {
    it("should return product with user relationship", async () => {
      productsRepository.findOne.mockResolvedValue({
        id: "p1",
        name: "Prod",
        price: 10,
        user: { id: "u1" },
      } as ProductEntity);

      const result = await service.fetchById("p1");

      expect(productsRepository.findOne).toHaveBeenCalledWith({
        where: { id: "p1" },
        relations: { user: true },
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: "p1",
          user: expect.objectContaining({ id: "u1" }) as ProductEntity,
        }),
      );
    });

    it("should throw NotFoundException when not found and throwError = true", async () => {
      productsRepository.findOne.mockResolvedValue(null);

      await expect(service.fetchById("p1", true)).rejects.toThrow(NotFoundException);
    });
  });

  describe("fetchAll", () => {
    it("should return products with standard pagination", async () => {
      productsRepository.find.mockResolvedValue([
        { id: "p1", user: { id: "u1" } },
      ] as ProductEntity[]);

      const result = await service.fetchAll();

      expect(productsRepository.find).toHaveBeenCalledWith({
        relations: { user: true },
        skip: DefaultPagination.PAGE * DefaultPagination.LIMIT,
        take: DefaultPagination.LIMIT,
      });
      expect(result).toHaveLength(1);
    });

    it("should respect the specified pagination", async () => {
      productsRepository.find.mockResolvedValue([] as ProductEntity[]);

      const result = await service.fetchAll({ page: 2, limit: 5 });

      expect(productsRepository.find).toHaveBeenCalledWith({
        relations: { user: true },
        skip: 2 * 5,
        take: 5,
      });
      expect(result).toEqual([]);
    });
  });

  describe("update", () => {
    it("should update user product", async () => {
      const spyVerify = jest
        .spyOn<any, any>(service as any, "verifyIsUserProduct")
        .mockResolvedValue({
          id: "p1",
          user: { id: "u1" },
        });

      productsRepository.preload.mockResolvedValue({
        id: "p1",
        name: "Novo",
        user: { id: "u1" },
      } as ProductEntity);

      productsRepository.save.mockResolvedValue({
        id: "p1",
        name: "Novo",
        user: { id: "u1" },
      } as ProductEntity);

      const dto: UpdateProductDTO = { name: "Novo" };

      const result = await service.update("p1", dto, "u1");

      expect(spyVerify).toHaveBeenCalledWith("p1", "u1");
      expect(productsRepository.preload).toHaveBeenCalledWith({
        id: "p1",
        user: { id: "u1" },
        ...dto,
      });
      expect(result).toEqual(expect.objectContaining({ id: "p1", name: "Novo" }));
    });
  });

  describe("delete", () => {
    it("should return true when exactly 1 record is removed", async () => {
      productsRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      const ok = await service.delete("p1", "u1");

      expect(productsRepository.delete).toHaveBeenCalledWith({ id: "p1", user: { id: "u1" } });
      expect(ok).toBe(true);
    });

    it("should return false when no records are removed", async () => {
      productsRepository.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

      const ok = await service.delete("p1", "u1");

      expect(ok).toBe(false);
    });
  });
});
