import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/signIn.dto';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../../src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { GoogleStrategy } from './strategy/google.strategy';
import { SocialLoginProvider } from './model/social-login-provider.model';
import { NaverStrategy } from './strategy/naver.strategy';
import { KakaoStrategy } from './strategy/kakao.strategy';
import { LoginResponseDto } from './dto/response/Login-Response.dto';

@Injectable()
export class AuthService {
  private strategy = {};

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly conifgService: ConfigService,
    private readonly googleStrategy: GoogleStrategy,
    private readonly naverStrategy: NaverStrategy,
    private readonly kakaoStrategy: KakaoStrategy,
  ) {
    this.strategy[SocialLoginProvider.GOOGLE] = googleStrategy;
    this.strategy[SocialLoginProvider.NAVER] = naverStrategy;
    this.strategy[SocialLoginProvider.KAKAO] = kakaoStrategy;
  }

  //액세스토큰, 리프레시 토큰 발급.
  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userService.getUser({
      email: dto.email,
      pw: dto.pw,
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const accessToken = await this.generateToken('access', user.idx, 12 * 3600);
    const refreshToken = await this.generateToken(
      'refresh',
      user.idx,
      12 * 3600,
    );
    return { accessToken, refreshToken };
  }

  async generateToken(
    type: 'access' | 'refresh',
    userIdx: string,
    exp: number,
  ): Promise<string> {
    const payload = {
      idx: userIdx,
      tokenType: type,
    };

    const token = this.jwtService.signAsync(payload, { expiresIn: exp });

    return token;
  }

  async getToken(
    req: Request,
    res: Response,
    provider: SocialLoginProvider,
  ): Promise<{ accessToken: string }> {
    let strategy = this.strategy[provider];

    if (!strategy) {
      throw new NotFoundException('Not Found OAuth Service');
    }

    return strategy.getTokenRequest(req, res);
  }

  async socialLogin(
    provider: string,
    query: any,
  ): Promise<{ accessToken: string }> {
    let strategy = this.strategy[provider];

    if (!strategy) {
      throw new NotFoundException('Not Found OAuth Service');
    }

    return strategy.socialLogin(query);
  }
}
