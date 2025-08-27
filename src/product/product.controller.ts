import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
  HttpCode,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetParamsDto } from 'src/common/dtos/params.dto';
import { CurrentShopService } from 'src/auth/current-shop/current-shop.service';
import { DeleteProductsDto } from './dto/delete-products.dto';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly currentShop: CurrentShopService,
  ) {}
  private get shopId(): string {
    return this.currentShop.shop.id;
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto, this.shopId);
  }

  @Get()
  findAll(@Query() query: GetParamsDto) {
    const { page, limit, search, dateFrom, dateTo } = query;

    return this.productService.getAllProduct(
      { page, limit, search, dateFrom, dateTo },
      this.shopId,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findOne(id, this.shopId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.updateProduct(id, updateProductDto, this.shopId);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.removeProduct(id, this.shopId);
  }

  @Post('delete-many')
  removeMany(@Body() dto: DeleteProductsDto) {
    return this.productService.removeMany(dto.ids, this.shopId);
  }
}
