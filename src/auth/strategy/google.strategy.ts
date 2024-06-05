import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    console.log(configService.get<string>('GOOGLE_CLIENT_ID'));
    console.log(configService.get<string>('GOOGLE_CLIENT_SECRET'));
    console.log(configService.get<string>('GOOGLE_REDIRECT_URI'));

    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_REDIRECT_URI'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    cb: VerifyCallback,
  ) {
    const { name, email, sub } = profile._json;

    console.log('accessToken');
    console.log(accessToken);

    console.log('refreshToken');
    console.log(refreshToken);

    console.log('profile');
    console.log(profile);

    const user = {
      email,
      name,
      id: sub,
      provider: profile.provider,
      accessToken,
    };

    console.log(user);
    return user;
  }
}
