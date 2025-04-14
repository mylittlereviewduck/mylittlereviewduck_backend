import { UserService } from './../../user/user.service';
import { Request, Response } from 'express';
import { ISocialAuthStrategy } from '../interface/social-auth-strategy.interface';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AuthService } from '../auth.service';
import { LoginResponseDto } from '../dto/response/login-response.dto';
import { SocialLoginDto } from '../dto/social-login.dto';

@Injectable()
export class NaverStrategy implements ISocialAuthStrategy {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async getTokenRequest(req: Request, res: Response): Promise<void> {
    let url = `https://nid.naver.com/oauth2.0/authorize`;
    url += `?response_type=code`;
    url += `&client_id=${this.configService.get<string>('NAVER_CLIENT_ID')}`;
    url += `&redirect_uri=${this.configService.get<string>('NAVER_REDIRECT_URI')}`;
    url += `&state=test`;

    res.redirect(url);
  }

  async socialLogin(dto: SocialLoginDto): Promise<LoginResponseDto> {
    // let getTokenUrl = `https://nid.naver.com/oauth2.0/token`;
    // getTokenUrl += `?grant_type=authorization_code`;
    // getTokenUrl += `&client_id=${this.configService.get<string>('NAVER_CLIENT_ID')}`;
    // getTokenUrl += `&client_secret=${this.configService.get<string>('NAVER_CLIENT_SECRET')}`;
    // getTokenUrl += `&code=${dto.code}`;
    // getTokenUrl += `&state=test`;

    // const { data: tokenData } =
    //   await this.httpService.axiosRef.get(getTokenUrl);

    if (!dto.accessToken) throw new BadRequestException('need accessToken');

    let getUserInfoUrl = `https://openapi.naver.com/v1/nid/me`;

    const { data } = await this.httpService.axiosRef.get(getUserInfoUrl, {
      headers: {
        Authorization: `bearer ${dto.accessToken}`,
      },
    });

    const userInfo = data.response;

    let user = await this.userService.getUser({
      email: userInfo.email,
    });

    if (!user) {
      // 기존회원 아닌경우 네이버 회원가입
      const newUser = await this.userService.createUserWithOAuth({
        email: userInfo.email,
        provider: 'naver',
        providerKey: userInfo.id,
      });

      user = await this.userService.updateMyinfo(newUser.idx, {
        nickname: `${newUser.serialNumber}번째 오리`,
      });
    }

    const accessToken = await this.authService.generateToken(
      'access',
      user.idx,
      user.isAdmin,
      30 * 60,
    );

    const refreshToken = await this.authService.generateToken(
      'refresh',
      user.idx,
      user.isAdmin,
      14 * 24 * 3600,
    );

    await this.authService.createOrUpdateLoginUser(refreshToken, user.idx);

    return { accessToken, refreshToken, nickname: user.nickname };
  }

  // async socialAuth(code: string): Promise<LoginResponseDto> {
  //   let getTokenUrl = `https://nid.naver.com/oauth2.0/token`;
  //   getTokenUrl += `?grant_type=authorization_code`;
  //   getTokenUrl += `&client_id=${this.configService.get<string>('NAVER_CLIENT_ID')}`;
  //   getTokenUrl += `&client_secret=${this.configService.get<string>('NAVER_CLIENT_SECRET')}`;
  //   getTokenUrl += `&code=${code}`;
  //   getTokenUrl += `&state=test`;

  //   const { data: tokenData } =
  //     await this.httpService.axiosRef.get(getTokenUrl);

  //   let getUserInfoUrl = `https://openapi.naver.com/v1/nid/me`;

  //   const { data } = await this.httpService.axiosRef.get(getUserInfoUrl, {
  //     headers: {
  //       Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
  //     },
  //   });

  //   const userInfo = data.response;

  //   let user = await this.userService.getUser({
  //     email: userInfo.email,
  //   });

  //   if (!user) {
  //     // 기존회원 아닌경우 네이버 회원가입
  //     const newUser = await this.userService.createUserWithOAuth({
  //       email: userInfo.email,
  //       provider: 'naver',
  //       providerKey: userInfo.id,
  //     });

  //     user = await this.userService.updateMyinfo(newUser.idx, {
  //       nickname: `${newUser.serialNumber}번째 오리`,
  //     });
  //   }

  //   const accessToken = await this.authService.generateToken(
  //     'access',
  //     user.idx,
  //     user.isAdmin,
  //     30 * 60,
  //   );

  //   const refreshToken = await this.authService.generateToken(
  //     'refresh',
  //     user.idx,
  //     user.isAdmin,
  //     14 * 24 * 3600,
  //   );

  //   return { accessToken, refreshToken };
  // }
}
