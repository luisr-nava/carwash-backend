import { Injectable } from '@nestjs/common';
import { CreateCashflowDto } from './dto/create-cashflow.dto';
import { UpdateCashflowDto } from './dto/update-cashflow.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CashFlow } from './entities/cashflow.entity';
import { Between, Repository } from 'typeorm';
import { Sale } from 'src/sales/entities/sale.entity';
import { Expense } from 'src/expenses/entities/expense.entity';

@Injectable()
export class CashflowService {
  constructor(
    @InjectRepository(CashFlow)
    private readonly cashFlowRepository: Repository<CashFlow>,
  ) {}
  create(createCashflowDto: CreateCashflowDto) {
    return 'This action adds a new cashflow';
  }

  findAll() {
    return `This action returns all cashflow`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cashflow`;
  }

  update(id: number, updateCashflowDto: UpdateCashflowDto) {
    return `This action updates a #${id} cashflow`;
  }

  remove(id: number) {
    return `This action removes a #${id} cashflow`;
  }
  async updateOrCreate(
    shopId: string,
    amount: number,
    type: 'sale' | 'expense',
    date = new Date(),
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const cashFlow = await this.cashFlowRepository.findOne({
      where: {
        shop_id: shopId,
        date: Between(today, tomorrow),
      },
    });

    const numericAmount = Number(amount ?? 0);

    if (cashFlow) {
      const previousSales = Number(cashFlow.total_sales ?? 0);
      const previousExpenses = Number(cashFlow.total_expenses ?? 0);
      const openingCash = Number(cashFlow.opening_cash ?? 0);

      if (type === 'sale') {
        cashFlow.total_sales = previousSales + numericAmount;
        cashFlow.closing_cash =
          openingCash + cashFlow.total_sales - previousExpenses;
      } else {
        cashFlow.total_expenses = previousExpenses + numericAmount;
        cashFlow.closing_cash =
          openingCash + previousSales - cashFlow.total_expenses;
      }
      await this.cashFlowRepository.save(cashFlow);
    } else {
      const newCashFlow = this.cashFlowRepository.create({
        shop_id: shopId,
        shop: { id: shopId },
        date: today.toISOString().split('T')[0],
        opening_cash: 0,
        total_sales: type === 'sale' ? numericAmount : 0,
        total_expenses: type === 'expense' ? numericAmount : 0,
        closing_cash: type === 'sale' ? numericAmount : -numericAmount,
      });
      await this.cashFlowRepository.save(newCashFlow);
    }
  }

  async recalculateCashFlow(
    shopId: string,
    date: Date,
    type: 'sale' | 'expense',
    repository: Repository<Sale> | Repository<Expense>,
    dateField: string,
  ) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const cashFlow = await this.cashFlowRepository.findOne({
      where: {
        shop_id: shopId,
        date: Between(dayStart, dayEnd),
      },
    });

    if (!cashFlow) return;

    if (type === 'sale') {
      const [activeItems, canceledItems] = await Promise.all([
        repository.find({
          where: {
            shop_id: shopId,
            [dateField]: Between(dayStart, dayEnd),
            is_canceled: false,
          },
        }),
        repository.find({
          where: {
            shop_id: shopId,
            [dateField]: Between(dayStart, dayEnd),
            is_canceled: true,
          },
        }),
      ]);

      const totalSales = activeItems.reduce(
        (acc, s) => acc + Number(s.amount ?? 0),
        0,
      );
      const totalCanceled = canceledItems.reduce(
        (acc, s) => acc + Number(s.amount ?? 0),
        0,
      );

      cashFlow.total_sales = totalSales;
      cashFlow.canceled_sales = totalCanceled;
    } else if (type === 'expense') {
      const [activeExpenses, canceledExpenses] = await Promise.all([
        repository.find({
          where: {
            shop_id: shopId,
            [dateField]: Between(dayStart, dayEnd),
            is_canceled: false,
          },
        }),
        repository.find({
          where: {
            shop_id: shopId,
            [dateField]: Between(dayStart, dayEnd),
            is_canceled: true,
          },
        }),
      ]);

      const totalExpenses = activeExpenses.reduce(
        (acc, e) => acc + Number(e.amount ?? 0),
        0,
      );

      const totalCanceledExpenses = canceledExpenses.reduce(
        (acc, e) => acc + Number(e.amount ?? 0),
        0,
      );

      cashFlow.total_expenses = totalExpenses;
      cashFlow.canceled_expenses = totalCanceledExpenses;
    }

    cashFlow.closing_cash =
      Number(cashFlow.opening_cash ?? 0) +
      Number(cashFlow.total_sales ?? 0) -
      Number(cashFlow.total_expenses ?? 0) -
      Number(cashFlow.canceled_sales ?? 0);

    await this.cashFlowRepository.save(cashFlow);
  }
}
