import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Shop } from 'src/shop/entities/shop.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { buildDateRangeFilter } from 'src/utils/date-filters';
import { GetParamsDto } from 'src/common/dtos/params.dto';
import { EntityValidatorService } from 'src/common/services/entity-validator.service';
import { QueryHelperService } from 'src/common/services/query-helper.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    private readonly queryHelper: QueryHelperService,

    private readonly entityValidator: EntityValidatorService,
  ) {}
  async createProduct(createProductDto: CreateProductDto, shopId: string) {
    await this.entityValidator.ensureShopExist(shopId);

    const product = this.productRepository.create({
      ...createProductDto,
      shop_id: shopId,
    });

    await this.productRepository.save(product);
    return {
      ...product,
      shopId,
    };
  }

  async getAllProduct(query: GetParamsDto, shopId: string) {
    await this.entityValidator.ensureShopExist(shopId);

    return await this.queryHelper.findAllWithFilters(
      this.productRepository,
      'product',
      shopId,
      query,
      {
        dateField: 'createdAt', // usar el nombre real del campo en la entidad
        searchField: 'name',
        joins: [{ relation: 'product.shop', alias: 'shop' }],
      },
    );
  }

  async findOne(id: string, shopId: string) {
    await this.entityValidator.ensureShopExist(shopId);
    const product = await this.entityValidator.ensureProductExist(id, shopId);
    return product;
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    shopId: string,
  ) {
    // TODO: Verificar que el producto que este asociado no cambie el el cashflow
    await this.entityValidator.ensureShopExist(shopId);
    const product = await this.entityValidator.ensureProductExist(id, shopId);

    const updatedProduct = await this.productRepository.save({
      ...product,
      ...updateProductDto,
    });

    return updatedProduct;
  }

  async removeProduct(id: string, shopId: string) {
    // TODO: Verificar que el producto no este asociado a ninguna compra
    await this.entityValidator.ensureShopExist(shopId);
    const product = await this.entityValidator.ensureProductExist(id, shopId);
    await this.productRepository.delete(id);

    return `El producto ${product.name} ha sido eliminado`;
  }

  async removeMany(ids: string[], shopId: string): Promise<Product[]> {
    await this.entityValidator.ensureShopExist(shopId);

    const products = await this.productRepository.find({
      where: {
        id: In(ids),
        shop: { id: shopId },
      },
    });

    if (products.length === 0) {
      throw new NotFoundException('No se encontraron productos para eliminar');
    }

    await this.productRepository.delete(ids);

    return products;
  }
}
