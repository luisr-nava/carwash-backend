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
} from '@nestjs/common';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { ProductService } from 'src/product/product.service';
import { CurrentShopService } from 'src/auth/current-shop/current-shop.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetParamsDto } from 'src/common/dtos/params.dto';

@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly productService: ProductService,
    private readonly currentShop: CurrentShopService,
  ) {}

  private get shopId(): string {
    return this.currentShop.shop.id;
  }

  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.createSale(createSaleDto, this.shopId);
  }

  @Get()
  findAll(@Query() query: GetParamsDto) {
    const { page, limit, search, dateFrom, dateTo } = query;
    return this.salesService.findAllSale(
      { page, limit, search, dateFrom, dateTo },
      this.shopId,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.salesService.findOneSale(id, this.shopId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
    shopId: string,
  ) {
    return this.salesService.updateSale(id, updateSaleDto, shopId);
  }
}
