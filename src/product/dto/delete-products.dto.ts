import { IsUUID, ArrayNotEmpty, IsArray } from 'class-validator';

export class DeleteProductsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  ids: string[];
}
