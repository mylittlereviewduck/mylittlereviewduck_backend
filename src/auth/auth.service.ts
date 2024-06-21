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
import { AppleStrategy } from './strategy/apple.strategy';

@Injectable()
export class AuthService {
  private strategy = {};

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly googleStrategy: GoogleStrategy,
  ) {
    this.strategy[SocialLoginProvider.GOOGLE] = googleStrategy;
  }

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.prismaService.accountTb.findFirst({
      where: {
        email: loginDto.email,
        pw: loginDto.pw,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const payload = { idx: user.idx };

    return await this.jwtService.signAsync(payload);
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

  async socialAuthCallbck(
    provider: string,
    query: any,
  ): Promise<{ accessToken: string }> {
    let strategy = this.strategy[provider];

    if (!strategy) {
      throw new NotFoundException('Not Found OAuth Service');
    }

    return strategy.socialAuthCallback(query);
  }

  async createVerificationCode(): Promise<number> {
    return Math.floor(Math.random() * 900000 + 100000);
  }
}
