import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Shop } from 'src/shop/entities/shop.entity';

@Injectable({ scope: Scope.REQUEST })
export class CurrentShopService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  get shop(): Shop {
    return this.request.user as Shop;
  }

  get shopId(): string {
    return this.shop.id;
  }
}
