import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityValidatorService } from 'src/common/services/entity-validator.service';
import { Product } from 'src/product/entities/product.entity';
import { Shop } from 'src/shop/entities/shop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Shop])],
  providers: [EntityValidatorService],
  exports: [EntityValidatorService],
})
export class SharedModule {}
