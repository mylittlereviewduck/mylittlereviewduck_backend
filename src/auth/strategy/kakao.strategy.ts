import { UserService } from './../../user/user.service';
import { Request, Response } from 'express';
import { ISocialAuthStrategy } from '../interface/social-auth-strategy.interface';
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { LoginResponseDto } from '../dto/response/login-response.dto';
import { SocialLoginDto } from '../dto/social-login.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class KakaoStrategy implements ISocialAuthStrategy {
  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly prismaService: PrismaService,
  ) {}

  async getTokenRequest(req: Request, res: Response): Promise<void> {
    let url = `https://kauth.kakao.com/oauth/authorize`;
    url += `?client_id=${this.configService.get<string>('KAKAO_CLIENT_ID')}`;
    url += `&redirect_uri=${this.configService.get<string>('KAKAO_REDIRECT_URI')}`;
    url += `&response_type=code`;

    res.redirect(url);
  }

  async socialLogin(dto: SocialLoginDto): Promise<LoginResponseDto> {
    // const { data: tokenData } = await this.httpService.axiosRef.post(
    //   `https://kauth.kakao.com/oauth/token`,
    //   {
    //     grant_type: 'authorization_code',
    //     client_id: this.configService.get<string>('KAKAO_CLIENT_ID'),
    //     redirect_uri: this.configService.get<string>('KAKAO_REDIRECT_URI'),
    //     code: dto.code,
    //   },
    //   {
    //     headers: {
    //       'Content-Type': 'application/x-www-form-urlencoded',
    //     },
    //   },
    // );
    try {
      if (!dto.accessToken) throw new BadRequestException('need accessToken');

      const { data: userData } = await this.httpService.axiosRef.get(
        `https://kapi.kakao.com/v2/user/me`,
        {
          headers: {
            Authorization: `bearer ${dto.accessToken}`,
            'Content-Type': `application/x-www-form-urlencoded;charset=utf-8`,
          },
        },
      );

      let user = await this.userService.getUser({
        email: userData.kakao_account.email,
      });

      if (!user) {
        // 기존회원 아닌경우 카카오 회원가입
        await this.prismaService.$transaction(async (tx) => {
          const newUser = await this.userService.createUserWithOAuth(
            {
              email: userData.kakao_account.email,
              provider: 'kakao',
              providerKey: String(userData.id),
            },
            tx,
          );

          user = await this.userService.forceUpdateNickname(
            newUser.idx,
            `${newUser.serialNumber}번째 오리`,
            tx,
          );
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
    } catch (error) {
      console.error('KAKAO OAUTH API Error:', error.response?.data);
      throw error;
    }
  }

  // async socialAuth(code: string): Promise<LoginResponseDto> {
  //   const { data: tokenData } = await this.httpService.axiosRef.post(
  //     `https://kauth.kakao.com/oauth/token`,
  //     {
  //       grant_type: 'authorization_code',
  //       client_id: this.configService.get<string>('KAKAO_CLIENT_ID'),
  //       redirect_uri: this.configService.get<string>('KAKAO_REDIRECT_URI'),
  //       code,
  //     },
  //     {
  //       headers: {
  //         'Content-Type': 'application/x-www-form-urlencoded',
  //       },
  //     },
  //   );

  //   const { data: userData } = await this.httpService.axiosRef.get(
  //     `https://kapi.kakao.com/v2/user/me`,
  //     {
  //       headers: {
  //         Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
  //         'Content-Type': `application/x-www-form-urlencoded;charset=utf-8`,
  //       },
  //     },
  //   );

  //   let user = await this.userService.getUser({
  //     email: userData.kakao_account.email,
  //   });

  //   if (!user) {
  //     // 기존회원 아닌경우 카카오 회원가입
  //     const newUser = await this.userService.createUserWithOAuth({
  //       email: userData.kakao_account.email,
  //       provider: 'kakao',
  //       providerKey: String(userData.id),
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
