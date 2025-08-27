import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Shop } from 'src/shop/entities/shop.entity';

@Entity('cash_flow')
export class CashFlow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  shop_id: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  opening_cash: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  closing_cash: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total_sales: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total_expenses: number;

  @ManyToOne(() => Shop, (shop) => shop.cash_flows, { onDelete: 'CASCADE' })
  shop: Shop;
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  canceled_sales: number;
  
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  canceled_expenses: number;
}
