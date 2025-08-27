import { Shop } from 'src/shop/entities/shop.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column()
  amount: number;

  @Column()
  shop_id: string;

  @ManyToOne(() => Shop, (shop) => shop.expenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shop_id' })
  shop: Shop;

  @Column({ default: false })
  is_canceled: boolean;

  @Column({ type: 'timestamp' })
  expense_date: Date;
}
