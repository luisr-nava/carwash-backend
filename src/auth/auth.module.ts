import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from 'src/shop/entities/shop.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from './strategies/google.strategy';
import { Sale } from 'src/sales/entities/sale.entity';
import { Expense } from 'src/expenses/entities/expense.entity';
import { Product } from 'src/product/entities/product.entity';
import { CashflowController } from 'src/cashflow/cashflow.controller';
import { CashFlow } from 'src/cashflow/entities/cashflow.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Shop, Sale, Expense, Product, CashFlow]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '4h',
          },
        };
      },
    }),
  ],
})
export class AuthModule {}
