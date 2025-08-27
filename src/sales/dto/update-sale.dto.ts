import { PartialType } from '@nestjs/mapped-types';
import { CreateSaleDto } from './create-sale.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSaleDto extends PartialType(CreateSaleDto) {
  @IsBoolean()
  @IsOptional()
  is_canceled?: boolean;
}
