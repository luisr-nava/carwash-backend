import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetShop = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    const shop = req.user;

    if (!shop) {
      throw new InternalServerErrorException('shop not found (request)');
    }

    return data ? shop[data] : shop;
  },
);
