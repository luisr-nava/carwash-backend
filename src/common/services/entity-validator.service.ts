import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';
import { Shop } from 'src/shop/entities/shop.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EntityValidatorService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    @Optional()
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async ensureProductExist(
    productId: string,
    shopId: string,
  ): Promise<Product> {
    const product = await this.productRepository.findOneBy({
      id: productId,
      shop: { id: shopId },
    });

    if (!product) {
      throw new NotFoundException(`El producto con ID ${productId} no existe`);
    }

    return product;
  }

  async ensureShopExist(shopId: string): Promise<void> {
    const shop = await this.shopRepository.findOneBy({ id: shopId });

    if (!shop) {
      throw new NotFoundException(`La tienda con ID ${shopId} no existe`);
    }
  }
}
