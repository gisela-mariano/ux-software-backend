import { CartEntity } from "@modules/carts/entities/cart.entity";
import { ProductEntity } from "@modules/products/entities/product.entity";
import { UserRole } from "@modules/users/dtos/user.dto";
import { BaseEntity } from "@shared/entities/base.entity";
import { Column, Entity, OneToMany } from "typeorm";

@Entity({ name: "users" })
export class UserEntity extends BaseEntity {
  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ type: "varchar", length: 255, nullable: false, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: false, select: false })
  passwordHash: string;

  @Column({ type: "enum", enum: UserRole, array: true, default: [UserRole.CLIENT] })
  roles: UserRole[];

  @OneToMany(() => CartEntity, (cart) => cart.user)
  carts: CartEntity[];

  @OneToMany(() => ProductEntity, (product) => product.user)
  products: ProductEntity[];
}
