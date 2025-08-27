import { IsEmail, IsString } from 'class-validator';

export class LoginShopDto {
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}
