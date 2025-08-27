import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from 'src/shop/entities/shop.entity';
import { Expense } from './entities/expense.entity';
import { EntityValidatorService } from 'src/common/services/entity-validator.service';
import { CurrentShopService } from 'src/auth/current-shop/current-shop.service';
import { SharedModule } from 'src/shared/shared.module';
import { CashflowModule } from 'src/cashflow/cashflow.module';
import { QueryHelperService } from 'src/common/services/query-helper.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop, Expense]),
    SharedModule,
    CashflowModule,
  ],
  controllers: [ExpensesController],
  providers: [
    ExpensesService,
    CurrentShopService,
    EntityValidatorService,
    QueryHelperService,
  ],
})
export class ExpensesModule {}
