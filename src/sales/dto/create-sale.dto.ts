import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSaleDto {
  @IsString()
  @IsOptional()
  sale_date: string;
  // @IsOptional()
  // @IsNumber({ maxDecimalPlaces: 2 })
  // amount: number;
  @IsString()
  @IsNotEmpty()
  payment_method: string;
  @IsArray()
  items: CreateSaleItemDto[];
  @IsOptional()
  @IsBoolean()
  is_canceled: boolean;
}

export class CreateSaleItemDto {
  @IsString()
  product_id: string;
  @IsNumber({ maxDecimalPlaces: 2 })
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  unit_price: number;
  @IsNumber({ maxDecimalPlaces: 2 })
  total_price: number;
}
