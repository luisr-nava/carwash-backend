import { Module } from '@nestjs/common';
import { CashflowService } from './cashflow.service';
import { CashflowController } from './cashflow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashFlow } from './entities/cashflow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CashFlow])],
  providers: [CashflowService],
  exports: [CashflowService],
})
export class CashflowModule {}
