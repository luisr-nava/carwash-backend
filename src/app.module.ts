import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { AppointmentModule } from './appointment/appointment.module';
import { ShopModule } from './shop/shop.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { ExpensesModule } from './expenses/expenses.module';
import { SalesModule } from './sales/sales.module';
import { CashflowModule } from './cashflow/cashflow.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: typeOrmConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    ProductModule,
    AppointmentModule,
    ShopModule,
    ExpensesModule,
    SalesModule,
    CashflowModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
