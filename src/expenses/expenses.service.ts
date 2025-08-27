import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Shop } from 'src/shop/entities/shop.entity';
import { Between, Repository } from 'typeorm';
import { CashFlow } from 'src/cashflow/entities/cashflow.entity';
import { EntityValidatorService } from 'src/common/services/entity-validator.service';
import { Expense } from './entities/expense.entity';
import { CashflowService } from 'src/cashflow/cashflow.service';
import { QueryHelperService } from 'src/common/services/query-helper.service';
import { GetParamsDto } from 'src/common/dtos/params.dto';

@Injectable()
export class ExpensesService {
  constructor(
    // @InjectRepository(Shop)
    // private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,

    private readonly queryHelper: QueryHelperService,
    private readonly entityValidator: EntityValidatorService,
    private readonly cashFlowService: CashflowService,
  ) {}
  async createExpense(createExpenseDto: CreateExpenseDto, shopId: string) {
    await this.entityValidator.ensureShopExist(shopId);
    const { ...expenseData } = createExpenseDto;
    const expense = {
      ...expenseData,
      expense_date: new Date(),
      amount: +expenseData.amount,
      is_canceled: false,
      shop_id: shopId,
    };

    const savedExpese = await this.expenseRepository.save(expense);

    await this.cashFlowService.updateOrCreate(
      shopId,
      savedExpese.amount,
      'expense',
    );

    return savedExpese;
  }

  async findAllExpenses(query: GetParamsDto, shopId: string) {
    await this.entityValidator.ensureShopExist(shopId);
    return this.queryHelper.findAllWithFilters(
      this.expenseRepository,
      'expense',
      shopId,
      query,
      {
        dateField: 'createdAt',
        searchField: 'description',
      },
    );
  }

  async findOneExpense(id: string, shopId: string) {
    await this.entityValidator.ensureShopExist(shopId);

    const expense = await this.expenseRepository.findOneBy({
      id,
      shop_id: shopId,
    });

    if (!expense) {
      throw new NotFoundException(`Expense with id ${id} not found`);
    }

    return expense;
  }

  async updateExpense(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    shopId: string,
  ) {
    await this.entityValidator.ensureShopExist(shopId);

    const expense = await this.expenseRepository.findOneBy({
      id,
      shop_id: shopId,
    });

    if (!expense) {
      throw new NotFoundException(`Expense with id ${id} not found`);
    }
    const shouldCancel = updateExpenseDto.is_canceled;

    if (shouldCancel === expense.is_canceled) return expense;

    await this.expenseRepository.save({
      ...expense,
      ...updateExpenseDto,
      is_canceled: shouldCancel,
    });

    await this.cashFlowService.recalculateCashFlow(
      shopId,
      expense.expense_date,
      'expense',
      this.expenseRepository,
      'expense_date',
    );

    return { ...expense, is_canceled: shouldCancel };
  }

  async removeExpense(id: string, shopId: string) {
    await this.entityValidator.ensureShopExist(shopId);

    return `This action removes a #${id} expense`;
  }
}
