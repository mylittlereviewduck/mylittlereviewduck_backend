import { HttpService } from '@nestjs/axios';
import { Request, Response } from 'express';
import { ISocialAuthStrategy } from '../interface/social-auth-strategy.interface';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { LoginResponseDto } from '../dto/response/login-response.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';
import { AppleOauthDto } from '../dto/apple-oauth.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AppleStrategy implements ISocialAuthStrategy {
  constructor(
    private readonly userService: UserService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async getTokenRequest(req: Request, res: Response): Promise<void> {
    const url =
      `https://appleid.apple.com/auth/authorize?` +
      `response_type=code` +
      `&client_id=${this.configService.get<string>('APPLE_CLIENT_ID')}` +
      `&redirect_uri=${this.configService.get<string>('APPLE_REDIRECT_URI')}` +
      `&scope=name email` +
      `&response_mode=form_post`;

    res.redirect(url);
  }

  async socialLogin(dto: AppleOauthDto): Promise<LoginResponseDto> {
    if (!dto.authortizationCode)
      throw new BadRequestException('need accessToken');

    const { data: tokenData } = await this.httpService.axiosRef.post(
      `https://appleid.apple.com/auth/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: dto.authortizationCode,
        client_id: this.configService.get<string>('APPLE_CLIENT_ID'),
        client_secret: this.configService.get<string>('APPLE_CLIENT_SECRET'),
        redirect_uri: this.configService.get<string>('APPLE_REDIRECT_URI'),
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    // id_token을 디코딩하여 유저 정보를 추출
    const decodedToken = this.jwtService.decode(tokenData.id_token);
    const email = decodedToken?.email;
    const sub = decodedToken?.sub;

    if (!email || !sub) {
      throw new Error('Invalid id_token received from Apple');
    }

    let user = await this.userService.getUser({
      email: email,
    });

    if (!user) {
      const newUser = await this.userService.createUserWithOAuth({
        email: email,
        provider: 'apple',
        providerKey: String(sub), // Apple 사용자 식별자
      });

      user = await this.userService.updateMyinfo(newUser.idx, {
        nickname: `${newUser.serialNumber}번째 유저`,
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

    return { accessToken, refreshToken, nickname: user.nickname };
  }

  // async socialAuth(code: string): Promise<LoginResponseDto> {
  //   // Access Token 요청
  //   const { data: tokenData } = await this.httpService.axiosRef.post(
  //     `https://appleid.apple.com/auth/token`,
  //     new URLSearchParams({
  //       grant_type: 'authorization_code',
  //       code,
  //       client_id: this.configService.get<string>('APPLE_CLIENT_ID'),
  //       client_secret: this.configService.get<string>('APPLE_CLIENT_SECRET'),
  //       redirect_uri: this.configService.get<string>('APPLE_REDIRECT_URI'),
  //     }).toString(),
  //     {
  //       headers: {
  //         'Content-Type': 'application/x-www-form-urlencoded',
  //       },
  //     },
  //   );

  //   // 사용자 정보 요청
  //   const payload = tokenData.id_token.split('.')[1];
  //   const userData = JSON.parse(Buffer.from(payload, 'base64').toString());

  //   let user = await this.userService.getUser({
  //     email: userData.email,
  //   });

  //   if (!user) {
  //     // 기존 회원이 아닌 경우 애플 회원가입
  //     const newUser = await this.userService.createUserWithOAuth({
  //       email: userData.email,
  //       provider: 'apple',
  //       providerKey: String(userData.sub), // Apple에서 제공하는 고유 사용자 ID
  //     });

  //     user = await this.userService.updateMyinfo(newUser.idx, {
  //       nickname: `${newUser.serialNumber}번째 유저`,
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
