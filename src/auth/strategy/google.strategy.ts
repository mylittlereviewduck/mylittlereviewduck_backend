import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { ISocialAuthStrategy } from '../interface/social-auth-strategy.interface';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../../src/user/user.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { GoogleCallbackDto } from '../dto/google-callback.dto';

@Injectable()
export class GoogleStrategy implements ISocialAuthStrategy {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService,
    private readonly configServce: ConfigService,
  ) {}

  async getTokenRequest(req: Request, res: Response): Promise<void> {
    let url = `https://accounts.google.com/o/oauth2/v2/auth`;
    url += `?client_id=${this.configServce.get<string>('GOOGLE_CLIENT_ID')}`;
    url += `&redirect_uri=${this.configServce.get<string>('GOOGLE_REDIRECT_URI')}`;
    url += `&response_type=code`;
    url += `&scope=email profile`;

    res.redirect(url);
  }

  async socialAuthCallback(
    query: GoogleCallbackDto,
  ): Promise<{ accessToken: string }> {
    const { code, scope, authuser, prompt } = query;

    const tokenRequestBody = {
      client_id: this.configServce.get<string>('GOOGLE_CLIENT_ID'),
      client_secret: this.configServce.get<string>('GOOGLE_CLIENT_SECRET'),
      code: code,
      redirect_uri: this.configServce.get<string>('GOOGLE_REDIRECT_URI'),
      grant_type: 'authorization_code',
    };

    let tokenUrl = `https://oauth2.googleapis.com/token`;

    const { data: tokenData } = await this.httpService.axiosRef.post(
      tokenUrl,
      tokenRequestBody,
    );

    const userInfoUrl = `https://www.googleapis.com/oauth2/v2/userinfo`;

    const { data: userInfo } = await this.httpService.axiosRef.get(
      userInfoUrl,
      {
        headers: {
          Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
        },
      },
    );

    let user = await this.userService.getUser({ email: userInfo.email });

    if (!user) {
      user = await this.userService.createUserWithOAuth({
        email: userInfo.email,
        provider: 'google',
        providerKey: userInfo.id,
      });
    }

    const payload = { idx: user.idx };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
  }
}
