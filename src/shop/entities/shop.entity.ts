import { CashFlow } from 'src/cashflow/entities/cashflow.entity';
import { Expense } from 'src/expenses/entities/expense.entity';
import { Product } from 'src/product/entities/product.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('shop')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: 0 })
  employee: number;

  @Column({ default: false })
  is_verify: boolean;

  @OneToMany(() => Product, (product) => product.shop)
  products: Product[];

  @OneToMany(() => Expense, (expense) => expense.shop)
  expenses: Expense[];

  @OneToMany(() => Sale, (sale) => sale.shop)
  sales: Sale[];

  @OneToMany(() => CashFlow, (cashFlow) => cashFlow.shop)
  cash_flows: CashFlow[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
