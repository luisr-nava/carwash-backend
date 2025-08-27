import { SaleItem } from 'src/sales/entities/sale-item.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shop, (shop) => shop.products)
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => SaleItem, (item) => item.product)
  saleItems: SaleItem[];

  @Column()
  shop_id: string;
}
