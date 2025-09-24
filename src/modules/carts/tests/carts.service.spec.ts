/* eslint-disable @typescript-eslint/unbound-method */
import { AlreadyRegisteredException } from "@/exceptions";
import { ProductInDbJoinUser } from "@/modules/products/dtos/product.dto";
import { DefaultPagination } from "@/shared/interfaces/routeParams.interface";
import { CartsService } from "@modules/carts/carts.service";
import { AddProductToCartDTO, RemoveProductFromCartDTO } from "@modules/carts/dtos/cart.dto";
import { CartEntity } from "@modules/carts/entities/cart.entity";
import { ProductsService } from "@modules/products/products.service";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";

describe("CartsService", () => {
  let service: CartsService;
  let cartRepository: jest.Mocked<Repository<CartEntity>>;
  let productsService: jest.Mocked<ProductsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartsService,
        {
          provide: getRepositoryToken(CartEntity),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            preload: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            fetchById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartsService>(CartsService);
    cartRepository = module.get(getRepositoryToken(CartEntity));
    productsService = module.get(ProductsService);
  });

  describe("addProduct", () => {
    it("should add a new product to user cart", async () => {
      productsService.fetchById.mockResolvedValue({ id: "prod-1" } as ProductInDbJoinUser);
      cartRepository.findOne.mockResolvedValue(null);
      cartRepository.save.mockResolvedValue({
        id: "cart-1",
        quantity: 2,
        user: { id: "user-1" },
        product: { id: "prod-1" },
      } as CartEntity);

      const payload: AddProductToCartDTO = { productId: "prod-1", quantity: 2 };

      const result = await service.addProduct(payload, "user-1");

      expect(productsService.fetchById).toHaveBeenCalledWith("prod-1", true);
      expect(cartRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: "user-1" }, product: { id: "prod-1" } },
      });
      expect(cartRepository.save).toHaveBeenCalledWith({
        productId: "prod-1",
        quantity: 2,
        user: { id: "user-1" },
        product: { id: "prod-1" },
      });
      expect(result).toEqual(expect.objectContaining({ id: "cart-1", quantity: 2 }));
    });

    it("should throw AlreadyRegisteredException if product already in cart", async () => {
      productsService.fetchById.mockResolvedValue({ id: "prod-1" } as ProductInDbJoinUser);
      cartRepository.findOne.mockResolvedValue({ id: "cart-1" } as CartEntity);

      await expect(
        service.addProduct({ productId: "prod-1", quantity: 1 }, "user-1"),
      ).rejects.toThrow(AlreadyRegisteredException);
    });
  });

  describe("listUserCart", () => {
    it("should list user cart with default pagination", async () => {
      cartRepository.find.mockResolvedValue([{ id: "c1", product: { id: "p1" } }] as CartEntity[]);

      const result = await service.listUserCart("user-1");

      expect(cartRepository.find).toHaveBeenCalledWith({
        where: { user: { id: "user-1" } },
        relations: { product: true },
        skip: DefaultPagination.PAGE * DefaultPagination.LIMIT,
        take: DefaultPagination.LIMIT,
      });
      expect(result).toHaveLength(1);
    });

    it("should list user cart with provided pagination", async () => {
      cartRepository.find.mockResolvedValue([]);

      const result = await service.listUserCart("user-1", { page: 3, limit: 5 });

      expect(cartRepository.find).toHaveBeenCalledWith({
        where: { user: { id: "user-1" } },
        relations: { product: true },
        skip: 3 * 5,
        take: 5,
      });
      expect(result).toEqual([]);
    });
  });

  describe("updateProductQuantity", () => {
    it("should update quantity for existing cart product", async () => {
      cartRepository.findOne.mockResolvedValue({ id: "cart-1", quantity: 1 } as CartEntity);
      cartRepository.preload.mockResolvedValue({ id: "cart-1", quantity: 5 } as CartEntity);
      cartRepository.save.mockResolvedValue({ id: "cart-1", quantity: 5 } as CartEntity);

      const result = await service.updateProductQuantity(
        { productId: "prod-1", quantity: 5 },
        "user-1",
      );

      expect(cartRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: "user-1" }, product: { id: "prod-1" } },
      });
      expect(cartRepository.preload).toHaveBeenCalledWith({ id: "cart-1", quantity: 5 });
      expect(result).toEqual(expect.objectContaining({ id: "cart-1", quantity: 5 }));
    });

    it("should throw NotFoundException if cart product does not exist", async () => {
      cartRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProductQuantity({ productId: "prod-1", quantity: 2 }, "user-1"),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("removeProduct", () => {
    it("should delete record when all=true", async () => {
      cartRepository.findOne.mockResolvedValue({ id: "cart-1", quantity: 3 } as CartEntity);
      cartRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      const payload: RemoveProductFromCartDTO = { productId: "prod-1", quantity: 1, all: true };
      const ok = await service.removeProduct(payload, "user-1");

      expect(cartRepository.delete).toHaveBeenCalledWith({
        user: { id: "user-1" },
        product: { id: "prod-1" },
      });
      expect(ok).toBe(true);
    });

    it("should delete record when resulting quantity <= 0", async () => {
      cartRepository.findOne.mockResolvedValue({ id: "cart-1", quantity: 2 } as CartEntity);
      cartRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      const ok = await service.removeProduct(
        { productId: "prod-1", quantity: 3, all: false },
        "user-1",
      );

      expect(cartRepository.delete).toHaveBeenCalled();
      expect(ok).toBe(true);
    });

    it("should update quantity when resulting quantity > 0", async () => {
      cartRepository.findOne.mockResolvedValue({ id: "cart-1", quantity: 5 } as CartEntity);
      cartRepository.update.mockResolvedValue({ affected: 1 } as UpdateResult);

      const ok = await service.removeProduct(
        { productId: "prod-1", quantity: 3, all: false },
        "user-1",
      );

      expect(cartRepository.update).toHaveBeenCalledWith({ id: "cart-1" }, { quantity: 2 });
      expect(ok).toBe(true);
    });

    it("should throw NotFoundException when product not in cart", async () => {
      cartRepository.findOne.mockResolvedValue(null);

      await expect(
        service.removeProduct({ productId: "prod-1", quantity: 1, all: false }, "user-1"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
