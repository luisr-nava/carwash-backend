import { PaginationDto } from 'src/common/dtos/paginations.dto';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class GetParamsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
