import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CurrentShopService } from 'src/auth/current-shop/current-shop.service';
import { ShopModule } from 'src/shop/shop.module';
import { Shop } from 'src/shop/entities/shop.entity';
import { SharedModule } from 'src/shared/shared.module';
import { QueryHelperService } from 'src/common/services/query-helper.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Shop]), SharedModule],
  controllers: [ProductController],
  providers: [ProductService, CurrentShopService, QueryHelperService],
  exports: [ProductService],
})
export class ProductModule {}
