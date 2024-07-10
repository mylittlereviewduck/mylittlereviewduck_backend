import { UserService } from './../../user/user.service';
import { Request, Response } from 'express';
import { ISocialAuthStrategy } from '../interface/social-auth-strategy.interface';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class NaverStrategy implements ISocialAuthStrategy {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly userService: UserService,
  ) {}

  async getTokenRequest(req: Request, res: Response): Promise<void> {
    console.log('네이버로그인실행');

    let url = `https://nid.naver.com/oauth2.0/authorize`;
    url += `?response_type=code`;
    url += `&client_id=${this.configService.get<string>('NAVER_CLIENT_ID')}`;
    url += `&redirect_uri=${this.configService.get<string>('NAVER_REDIRECT_URI')}`;
    url += `&state=test`;

    res.redirect(url);
  }

  async socialLogin(query: any): Promise<{ accessToken: string }> {
    const { code, state } = query;

    let getTokenUrl = `https://nid.naver.com/oauth2.0/token`;
    getTokenUrl += `?grant_type=authorization_code`;
    getTokenUrl += `&client_id=${this.configService.get<string>('NAVER_CLIENT_ID')}`;
    getTokenUrl += `&client_secret=${this.configService.get<string>('NAVER_CLIENT_SECRET')}`;
    getTokenUrl += `&code=${code}`;
    getTokenUrl += `&state=test`;

    const { data: tokenData } =
      await this.httpService.axiosRef.get(getTokenUrl);

    console.log('tokenData', tokenData);

    let getUserInfoUrl = `https://openapi.naver.com/v1/nid/me`;

    const { data } = await this.httpService.axiosRef.get(getUserInfoUrl, {
      headers: {
        Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
      },
    });

    const userInfo = data.response;

    let user = await this.userService.getUser({
      email: userInfo.email,
    });

    if (!user) {
      user = await this.userService.createUserWithOAuth({
        email: userInfo.email,
        provider: 'naver',
        providerKey: userInfo.id,
      });
    }

    const payload = { idx: user.idx };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}
