import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { SocialAuthDto } from '../dto/social-auth.dto';
import { SocialWithdrawDto } from '../dto/social-withdraw.dto';
import { ISocialAuthStrategy } from '../interface/social-auth-strategy.interface';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GoogleStrategy implements ISocialAuthStrategy {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
  ) {}

  async socialAuth(
    req: Request,
    social: string,
    socialAuthDto: SocialAuthDto,
  ): Promise<{ accessToken: string }> {
    let url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}`;
    url += `&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}`;
    url += `&response_type=code`;
    url += `&scope=email profile`;

    const response = await this.httpService.axiosRef(url);
    console.log('response: ', response);

    const { providerKey, email } = socialAuthDto;

    let user = await this.userService.getUser({ email: email });

    if (!user) {
      user = await this.userService.signUpOAuth({
        email: email,
        provider: social,
        providerKey: providerKey,
      });
    }

    const payload = { idx: user.idx };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken: accessToken };
  }

  async socialWithdraw(
    accessToken: string,
    socialWithdrawDto: SocialWithdrawDto,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
