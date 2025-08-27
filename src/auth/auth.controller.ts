import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginShopDto } from './dto/login.dto';
import { GetShop } from './decorators/get-shop.decorators';
import { Shop } from 'src/shop/entities/shop.entity';
import { AuthGuard } from '@nestjs/passport';
import { envs } from 'src/config/envs';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginShopDto: LoginShopDto) {
    return this.authService.login(loginShopDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-user')
  getUser(@GetShop() shop: Shop) {
    const shopId = shop.id;
    // return this.authService.getShop(shopId);
      return this.authService.getShopWithData(shopId);

  }

  @Get('google/url')
  getGoogleUrl(@Query('mode') mode: 'login' | 'register' = 'login') {
    return { url: this.authService.getGoogleAuthUrl(mode) }; // ← pasa mode como state
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res) {
    const mode = (req.query?.state as 'login' | 'register') ?? 'login';
    const payload = await this.authService.handleGoogleLogin(req.user, mode);
    const origin = process.env.FRONTEND_ORIGIN;
    const safePayload = JSON.stringify(payload).replace(/</g, '\\u003c');
    const safeOrigin = JSON.stringify(origin);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html><html><body>
    <script>
    (function () {
      try {
        var payload = ${safePayload};
        var origin = ${safeOrigin};
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(payload, origin);
          setTimeout(function(){ window.close(); }, 300);
        } else {
          setTimeout(function(){ window.location.replace(origin); }, 300);
        }
      } catch (e) {
        setTimeout(function(){ window.location.replace(${safeOrigin}); }, 300);
      }
    })();
    </script>
    </body></html>`);
  }
}
