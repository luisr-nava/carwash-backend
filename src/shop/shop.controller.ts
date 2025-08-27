import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopService.createShop(createShopDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShopDto: UpdateShopDto,
  ) {
    return this.shopService.update(id, updateShopDto);
  }
}
