import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { EntityValidatorService } from 'src/common/services/entity-validator.service';
import { Sale } from './entities/sale.entity';
import { CashFlow } from 'src/cashflow/entities/cashflow.entity';
import { GetParamsDto } from 'src/common/dtos/params.dto';
import { buildDateRangeFilter } from 'src/utils/date-filters';
import { CashflowService } from 'src/cashflow/cashflow.service';
import { QueryHelperService } from 'src/common/services/query-helper.service';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class SalesService {
  constructor(
    // @InjectRepository(SaleItem)
    // private readonly saleItemRepository: Repository<SaleItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    // @InjectRepository(Shop)
    // private readonly shopRepository: Repository<Shop>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,

    private readonly cashFlowService: CashflowService,
    private readonly entityValidator: EntityValidatorService,
    private readonly queryHelper: QueryHelperService,
  ) {}
  async createSale(createSaleDto: CreateSaleDto, shopId: string) {
    await this.entityValidator.ensureShopExist(shopId);

    const { items, ...saleData } = createSaleDto;
    const productIds = items.map((i) => i.product_id);
    const existingProducts = await this.productRepository.find({
      where: { id: In(productIds) },
    });

    if (existingProducts.length !== productIds.length) {
      throw new NotFoundException('Uno o más productos no existen');
    }
    const totalAmount = items.reduce((acc, item) => acc + item.total_price, 0);

    const sale = this.saleRepository.create({
      ...saleData,
      sale_date: new Date(),
      is_canceled: false,
      shop_id: shopId,
      amount: totalAmount,
      items: items.map((item) => ({
        product: { id: item.product_id },
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      })),
    });

    const savedSale = await this.saleRepository.save(sale);

    await this.cashFlowService.updateOrCreate(shopId, savedSale.amount, 'sale');

    return savedSale;
  }

  async findAllSale(query: GetParamsDto, shopId: string) {
    await this.entityValidator.ensureShopExist(shopId);
    return await this.queryHelper.findAllWithFilters(
      this.saleRepository,
      'sale',
      shopId,
      query,
      {
        dateField: 'sale_date',
        searchField: 'payment_method',
        joins: [
          { relation: 'sale.items', alias: 'item' },
          { relation: 'item.product', alias: 'product' },
        ],
      },
    );
  }

  async findOneSale(id: string, shopId: string) {
    await this.entityValidator.ensureShopExist(shopId);
    const sale = await this.saleRepository.findOneBy({
      id,
      shop_id: shopId,
    });
    if (!sale) {
      throw new NotFoundException(`La venta con el ${id} no fue encontrada`);
    }
    return sale;
  }

  async updateSale(id: string, updateSaleDto: UpdateSaleDto, shopId: string) {
    await this.entityValidator.ensureShopExist(shopId);

    const sale = await this.saleRepository.findOne({
      where: { id, shop_id: shopId },
    });

    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }

    const shouldCancel = updateSaleDto.is_canceled;

    if (shouldCancel === sale.is_canceled) return sale;

    await this.saleRepository.save({
      ...sale,
      ...updateSaleDto,
      is_canceled: shouldCancel,
    });

    await this.cashFlowService.recalculateCashFlow(
      shopId,
      sale.sale_date,
      'sale',
      this.saleRepository,
      'sale_date',
    );

    return { ...sale, is_canceled: shouldCancel };
  }
}
