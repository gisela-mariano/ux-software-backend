import { UserEntity } from "@modules/users/entities/user.entity";
import { BaseEntity } from "@shared/entities/base.entity";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity({ name: "products" })
export class ProductEntity extends BaseEntity {
  @Column({ type: "varchar", length: 255, nullable: false })
  name: string;

  @Column({ type: "float", nullable: false })
  price: number;

  @Column({ type: "varchar", array: true, length: 255, nullable: true })
  imageUrls: string[];

  @Column({ type: "text", nullable: true })
  description: string;

  @ManyToOne(() => UserEntity, (user) => user.products, { nullable: false })
  user: UserEntity;
}
