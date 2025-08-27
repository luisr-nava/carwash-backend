import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginShopDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Shop } from 'src/shop/entities/shop.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { google } from 'googleapis';
import { envs } from '../config/envs';
import { ShopDashboardDto } from './dto/shop-dashboard.dto';
import { Expense } from 'src/expenses/entities/expense.entity';
import { Sale } from 'src/sales/entities/sale.entity';
import { Product } from 'src/product/entities/product.entity';
import { CashFlow } from 'src/cashflow/entities/cashflow.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Sale)
    private readonly salesRepository: Repository<Sale>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(CashFlow)
    private readonly cashflowRepository: Repository<CashFlow>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginShopDto: LoginShopDto) {
    const { password, email } = loginShopDto;

    const shop = await this.shopRepository.findOneBy({ email });

    let errors: string[] = [];

    if (!shop) {
      errors.push(`No hay un usuario registrado con el correo ${email}`);
      throw new UnauthorizedException(errors);
    }

    const isPasswordValid = bcrypt.compareSync(password, shop.password);
    if (!isPasswordValid) {
      errors.push('La contraseña es incorrecta');
      throw new UnauthorizedException(errors);
    }

    if (!shop.is_verify) {
      errors.push('El usuario no está verificado');
      throw new UnauthorizedException(errors);
    }

    const token = this.getJwtToken({ id: shop.id });
    return {
      token,
      shop,
    };
  }

  private getJwtToken(payload: { id: string }) {
    const token = this.jwtService.sign(payload, {
      expiresIn: '4h',
    });
    return token;
  }

  async getShopWithData(shopId: string): Promise<ShopDashboardDto> {
    const shop = await this.shopRepository.findOne({
      where: { id: shopId },
      select: ['id', 'name', 'email'],
    });
    if (!shop) {
      throw new NotFoundException([
        `No hay un usuario registrado con el id ${shopId}`,
      ]);
    }
    // Rangos de fechas
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayStart.getDate() + 1);

    const monthStart = new Date(todayStart);
    monthStart.setDate(1); // primer día del mes

    // Helpers
    const sumDecimal = (s: any, key = 'sum') => Number(s?.[key] ?? 0);

    // Queries paralelas
    const [
      salesTodayRaw,
      salesMonthRaw,
      salesTodayCanceledRaw,
      salesMonthCanceledRaw,

      expensesTodayRaw,
      expensesMonthRaw,
      expensesTodayCanceledRaw,
      expensesMonthCanceledRaw,

      cashflowToday,
      productsCount,
      latestProducts,
      latestSales,
      latestExpenses,
    ] = await Promise.all([
      // Ventas hoy (excluye canceladas)
      this.salesRepository
        .createQueryBuilder('s')
        .select('COALESCE(SUM(s.amount), 0)', 'sum')
        .where('s.shop_id = :shopId', { shopId })
        .andWhere('s.is_canceled = false')
        .andWhere('s.sale_date >= :from AND s.sale_date < :to', {
          from: todayStart,
          to: todayEnd,
        })
        .getRawOne(),

      // Ventas HOY canceladas
      this.salesRepository
        .createQueryBuilder('s')
        .select('COALESCE(SUM(s.amount), 0)', 'sum')
        .where('s.shop_id = :shopId', { shopId })
        .andWhere('s.is_canceled = true') // <-- cambia a true
        .andWhere('s.sale_date >= :from AND s.sale_date < :to', {
          from: todayStart,
          to: todayEnd,
        })
        .getRawOne(),

      // Ventas mes (excluye canceladas)
      this.salesRepository
        .createQueryBuilder('s')
        .select('COALESCE(SUM(s.amount), 0)', 'sum')
        .where('s.shop_id = :shopId', { shopId })
        .andWhere('s.is_canceled = false')
        .andWhere('s.sale_date >= :from AND s.sale_date < :to', {
          from: monthStart,
          to: todayEnd,
        })
        .getRawOne(),
      // Ventas MES canceladas
      this.salesRepository
        .createQueryBuilder('s')
        .select('COALESCE(SUM(s.amount), 0)', 'sum')
        .where('s.shop_id = :shopId', { shopId })
        .andWhere('s.is_canceled = true')
        .andWhere('s.sale_date >= :from AND s.sale_date < :to', {
          from: monthStart,
          to: todayEnd,
        })
        .getRawOne(),

      // Expenses hoy
      this.expenseRepository
        .createQueryBuilder('e')
        .select('COALESCE(SUM(e.amount), 0)', 'sum')
        .where('e.shop_id = :shopId', { shopId })
        .andWhere('e.expense_date >= :from AND e.expense_date < :to', {
          from: todayStart,
          to: todayEnd,
        })
        .getRawOne(),

      // Expenses mes
      this.expenseRepository
        .createQueryBuilder('e')
        .select('COALESCE(SUM(e.amount), 0)', 'sum')
        .where('e.shop_id = :shopId', { shopId })
        .andWhere('e.expense_date >= :from AND e.expense_date < :to', {
          from: monthStart,
          to: todayEnd,
        })
        .getRawOne(),

      // Expenses HOY canceladas
      this.expenseRepository
        .createQueryBuilder('e')
        .select('COALESCE(SUM(e.amount), 0)', 'sum')
        .where('e.shop_id = :shopId', { shopId })
        .andWhere('e.is_canceled = true')
        .andWhere('e.expense_date >= :from AND e.expense_date < :to', {
          from: todayStart,
          to: todayEnd,
        })
        .getRawOne(),

      // Expenses MES canceladas
      this.expenseRepository
        .createQueryBuilder('e')
        .select('COALESCE(SUM(e.amount), 0)', 'sum')
        .where('e.shop_id = :shopId', { shopId })
        .andWhere('e.is_canceled = true')
        .andWhere('e.expense_date >= :from AND e.expense_date < :to', {
          from: monthStart,
          to: todayEnd,
        })
        .getRawOne(),

      // Cashflow hoy (si existe)
      this.cashflowRepository.findOne({
        where: {
          shop_id: shopId,
          date: Between(todayStart, todayEnd),
        },
        select: [
          'id',
          'date',
          'opening_cash',
          'closing_cash',
          'total_sales',
          'total_expenses',
        ],
      }),

      // Cantidad total de productos
      this.productRepository.count({ where: { shop_id: shopId } }),

      // Últimos productos
      this.productRepository.find({
        where: { shop_id: shopId },
        order: { createdAt: 'DESC' as any },
        take: 5,
        select: ['id', 'name', 'price', 'createdAt'],
      }),

      // Últimas ventas (incluye canceladas, así el front puede marcarlas)
      this.salesRepository.find({
        where: { shop_id: shopId },
        order: { sale_date: 'DESC' as any },
        take: 5,
        select: ['id', 'amount', 'sale_date', 'is_canceled'],
      }),

      // Últimos gastos
      this.expenseRepository.find({
        where: { shop_id: shopId },
        order: { expense_date: 'DESC' as any },
        take: 5,
        select: ['id', 'amount', 'expense_date', 'description'],
      }),
    ]);

    // Armar respuesta
    return {
      shop: {
        id: shop.id,
        name: shop.name,
        email: shop.email,
      },

      stats: {
        today: {
          salesTotal: sumDecimal(salesTodayRaw),
          canceledSalesTotal: sumDecimal(salesTodayCanceledRaw),
          expensesTotal: sumDecimal(expensesTodayRaw),
          canceledExpensesTotal: sumDecimal(expensesTodayCanceledRaw),
        },

        month: {
          salesTotal: sumDecimal(salesMonthRaw),
          canceledSalesTotal: sumDecimal(salesMonthCanceledRaw),
          expensesTotal: sumDecimal(expensesMonthRaw),
          canceledExpensesTotal: sumDecimal(expensesMonthCanceledRaw),
        },
        productsCount,
      },

      cashflowToday: cashflowToday
        ? {
            id: cashflowToday.id,
            date: cashflowToday.date,
            openingCash: Number(cashflowToday.opening_cash ?? 0),
            closingCash: Number(cashflowToday.closing_cash ?? 0),
            totalSales: Number(cashflowToday.total_sales ?? 0),
            totalExpenses: Number(cashflowToday.total_expenses ?? 0),
          }
        : null,

      latest: {
        products: latestProducts.map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price ?? 0),
          createdAt: p['createdAt'] as any,
        })),
        sales: latestSales.map((s) => ({
          id: s.id,
          total: Number(s.amount ?? 0),
          sale_date: s['sale_date'] as any,
          is_canceled: !!s['is_canceled'],
        })),
        expenses: latestExpenses.map((e) => ({
          id: e.id,
          amount: Number(e.amount ?? 0),
          expense_date: e['expense_date'] as any,
          description: e['description'],
        })),
      },
    };
  }

  async getShop(id: string) {
    const shop = await this.shopRepository.findOneBy({ id });
    let errors: string[] = [];
    if (!shop) {
      errors.push(`No hay un usuario registrado con el id ${id}`);
      throw new NotFoundException(errors);
    }
    return shop;
  }

  private oauth2Client = new google.auth.OAuth2(
    envs.clientID,
    envs.clientSecret,
    // Todo: change to production url
    envs.googleRedirectUri,
  );

  getGoogleAuthUrl(mode: 'login' | 'register' = 'login') {
    const scopes = ['profile', 'email'];
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
      state: mode, // ← importante
    });
  }

  async handleGoogleLogin(
    googleUser: { email: string; name: string },
    mode: 'login' | 'register' = 'login',
  ) {
    const { email, name } = googleUser;

    const existing = await this.shopRepository.findOne({ where: { email } });

    if (mode === 'register' && existing) {
      return { ok: false, code: 409, error: 'Este email ya está registrado.' };
    }
    if (mode === 'login' && !existing) {
      return {
        ok: false,
        code: 404,
        error: 'No existe una cuenta con este email.',
      };
    }

    let shop = existing;
    if (mode === 'register' && !existing) {
      shop = this.shopRepository.create({
        email,
        name,
        password: '',
        is_verify: true,
      });
      await this.shopRepository.save(shop);
    }

    const token = this.getJwtToken({ id: shop!.id });
    return { ok: true, token, shop };
  }
}
