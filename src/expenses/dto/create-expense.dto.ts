import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsOptional()
  expense_date: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsOptional()
  @IsBoolean()
  is_canceled: boolean;
}
