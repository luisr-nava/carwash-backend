import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SaleItem } from './sale-item.entity';
import { IsOptional } from 'class-validator';
import { Shop } from 'src/shop/entities/shop.entity';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shop_id: string;
  @ManyToOne(() => Shop, (shop) => shop.sales, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;
  @Column({ type: 'timestamp' })
  sale_date: Date;

  @IsOptional()
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  payment_method: string;

  @Column({ default: false })
  is_canceled: boolean;

  @OneToMany(() => SaleItem, (item) => item.sale, {
    cascade: true,
    eager: true,
  })
  items: SaleItem[];
}
