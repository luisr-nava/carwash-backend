import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import { CurrentShopService } from 'src/auth/current-shop/current-shop.service';
import { ProductModule } from 'src/product/product.module';
import { SharedModule } from 'src/shared/shared.module';
import { SaleItem } from './entities/sale-item.entity';
import { Sale } from './entities/sale.entity';
import { EntityValidatorService } from 'src/common/services/entity-validator.service';
import { CashflowModule } from 'src/cashflow/cashflow.module';
import { QueryHelperService } from 'src/common/services/query-helper.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SaleItem, Product, Shop]),
    ProductModule,
    SharedModule,
    CashflowModule,
  ],
  controllers: [SalesController],
  providers: [
    SalesService,
    CurrentShopService,
    EntityValidatorService,
    QueryHelperService,
  ],
})
export class SalesModule {}
