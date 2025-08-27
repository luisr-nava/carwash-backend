import { Product } from 'src/product/entities/product.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Sale } from './sale.entity';

@Entity()
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Sale, (sale) => sale.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  quantity: number;
  @Column('decimal', { precision: 10, scale: 2 })
  unit_price: number;
  @Column('decimal', { precision: 10, scale: 2 })
  total_price: number;
}
