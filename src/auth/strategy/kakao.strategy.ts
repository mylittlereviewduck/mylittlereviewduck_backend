import { UserService } from './../../user/user.service';
import { Request, Response } from 'express';
import { ISocialAuthStrategy } from '../interface/social-auth-strategy.interface';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class KakaoStrategy implements ISocialAuthStrategy {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async getTokenRequest(req: Request, res: Response): Promise<void> {
    let url = `https://kauth.kakao.com/oauth/authorize`;
    url += `?client_id=${this.configService.get<string>('KAKAO_CLIENT_ID')}`;
    url += `&redirect_uri=${this.configService.get<string>('KAKAO_REDIRECT_URI')}`;
    url += `&response_type=code`;

    res.redirect(url);
  }

  async socialLogin(query: any): Promise<{ accessToken: string }> {
    const { code } = query;

    const { data: tokenData } = await this.httpService.axiosRef.post(
      `https://kauth.kakao.com/oauth/token`,
      {
        grant_type: 'authorization_code',
        client_id: this.configService.get<string>('KAKAO_CLIENT_ID'),
        redirect_uri: this.configService.get<string>('KAKAO_REDIRECT_URI'),
        code,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const { data: userData } = await this.httpService.axiosRef.get(
      `https://kapi.kakao.com/v2/user/me`,
      {
        headers: {
          Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
          'Content-Type': `application/x-www-form-urlencoded;charset=utf-8`,
        },
      },
    );

    let user = await this.userService.getUser({
      email: userData.kakao_account.email,
    });

    if (!user) {
      user = await this.userService.createUserWithOAuth({
        email: userData.kakao_account.email,
        nickname: uuidv4(),
        provider: 'kakao',
        providerKey: String(userData.id),
      });
    }

    const payload = { idx: user.idx };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}
