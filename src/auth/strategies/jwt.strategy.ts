import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Shop } from 'src/shop/entities/shop.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,
    configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET')!,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  async validate(payload: { id: string }): Promise<Shop> {
    const { id } = payload;

    const shop = await this.shopRepository.findOneBy({ id });

    if (!shop) throw new UnauthorizedException('Token not valid');

    if (!shop.is_verify)
      throw new UnauthorizedException('Please verify your email address');

    return shop;
  }
}
