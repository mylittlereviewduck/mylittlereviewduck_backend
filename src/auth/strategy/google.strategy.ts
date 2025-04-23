import { PrismaService } from './../../prisma/prisma.service';
import { Request, Response } from 'express';
import { ISocialAuthStrategy } from '../interface/social-auth-strategy.interface';
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { UserService } from '../../../src/user/user.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { LoginResponseDto } from '../dto/response/login-response.dto';
import { SocialLoginDto } from '../dto/social-login.dto';

@Injectable()
export class GoogleStrategy implements ISocialAuthStrategy {
  constructor(
    private readonly userService: UserService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly prismaService: PrismaService,
  ) {}

  async getTokenRequest(req: Request, res: Response): Promise<void> {
    let url = `https://accounts.google.com/o/oauth2/v2/auth`;
    url += `?client_id=${this.configService.get<string>('GOOGLE_CLIENT_ID')}`;
    url += `&redirect_uri=${this.configService.get<string>('GOOGLE_REDIRECT_URI')}`;
    url += `&response_type=code`;
    url += `&scope=email profile`;

    res.redirect(url);
  }

  async socialLogin(dto: SocialLoginDto): Promise<LoginResponseDto> {
    // const tokenRequestBody = {
    //   client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
    //   client_secret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
    //   code: dto.code,
    //   redirect_uri: this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    //   grant_type: 'authorization_code',
    // };

    // let tokenUrl = `https://oauth2.googleapis.com/token`;

    // const { data: tokenData } = await this.httpService.axiosRef.post(
    //   tokenUrl,
    //   tokenRequestBody,
    // );

    try {
      console.log('dto:', dto);
      if (!dto.accessToken) throw new BadRequestException('need accessToken');

      const userInfoUrl = `https://www.googleapis.com/oauth2/v2/userinfo`;

      const { data: userData } = await this.httpService.axiosRef.get(
        userInfoUrl,
        {
          headers: {
            //구글은 Bearer라고 보내야한다.
            Authorization: `Bearer ${dto.accessToken}`,
          },
        },
      );
      console.log('userData:', userData);

      let user = await this.userService.getUser({ email: userData.email });

      if (!user) {
        await this.prismaService.$transaction(async (tx) => {
          // 기존회원 아닌경우 구글 회원가입
          const newUser = await this.userService.createUserWithOAuth(
            {
              email: userData.email,
              provider: 'google',
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
      console.error('Google API Error:', error.response?.data);
      throw error;
    }
  }

  // async socialAuth(code: string): Promise<LoginResponseDto> {
  //   const tokenRequestBody = {
  //     client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
  //     client_secret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
  //     code: code,
  //     redirect_uri: this.configService.get<string>('GOOGLE_REDIRECT_URI'),
  //     grant_type: 'authorization_code',
  //   };

  //   let tokenUrl = `https://oauth2.googleapis.com/token`;

  //   const { data: tokenData } = await this.httpService.axiosRef.post(
  //     tokenUrl,
  //     tokenRequestBody,
  //   );

  //   const userInfoUrl = `https://www.googleapis.com/oauth2/v2/userinfo`;

  //   const { data: userData } = await this.httpService.axiosRef.get(
  //     userInfoUrl,
  //     {
  //       headers: {
  //         Authorization: `${tokenData.token_type} ${tokenData.access_token}`,
  //       },
  //     },
  //   );

  //   let user = await this.userService.getUser({ email: userData.email });

  //   if (!user) {
  //     // 기존회원 아닌경우 구글 회원가입
  //     const newUser = await this.userService.createUserWithOAuth({
  //       email: userData.email,
  //       provider: 'google',
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
