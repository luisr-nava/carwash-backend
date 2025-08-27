import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
  @IsBoolean()
  @IsOptional()
  is_canceled?: boolean;
}
