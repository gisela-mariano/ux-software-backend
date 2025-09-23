import { ProductEntity } from "@modules/products/entities/product.entity";
import { UserEntity } from "@modules/users/entities/user.entity";
import { BaseEntity } from "@shared/entities/base.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity({ name: "carts" })
export class CartEntity extends BaseEntity {
  @Column({ type: "smallint", nullable: true, default: 1 })
  quantity: number;

  @ManyToOne(() => UserEntity, (user) => user.carts, { nullable: false })
  @JoinColumn()
  user: UserEntity;

  @ManyToOne(() => ProductEntity, (product) => product.carts, {
    nullable: false,
    onDelete: "CASCADE",
  })
  product: ProductEntity;
}
