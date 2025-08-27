import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  StrategyOptions,
  VerifyCallback,
} from 'passport-google-oauth20';
import { envs } from 'src/config/envs';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_REDIRECT_URI!,
      scope: ['profile', 'email'],
    } as StrategyOptions);
  }
  

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const email = profile?.emails?.[0]?.value;
    const name =
      profile?.displayName ||
      `${profile?.name?.givenName ?? ''} ${profile?.name?.familyName ?? ''}`.trim();

    if (!email) return done(null, false); // o lanzar UnauthorizedException

    done(null, { email, name, provider: 'google' });
  }
}
