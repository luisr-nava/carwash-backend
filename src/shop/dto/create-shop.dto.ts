import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateShopDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString({
    message: 'El nombre de la tienda es obligatoria',
  })
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(8, 20)
  password: string;

  @IsOptional()
  @IsNumber()
  employee: number = 0;

  @IsOptional()
  @IsBoolean()
  is_verify: boolean = false;
}
