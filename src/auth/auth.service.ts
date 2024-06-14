import { SignInDto } from './dto/signIn.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { ISocialAuthStrategy } from './interface/social-auth-strategy.interface';
import { SocialAuthDto } from './dto/social-auth.dto';
import { SocialWithdrawDto } from './dto/social-withdraw.dto';
import { GoogleStrategy } from './strategy/google.strategy';
import { SocialLoginProvider } from './model/social-login-provider.model';
import { UserWithProvider } from '../user/model/user-with-provider.model';
import { LoginUser } from './model/login-user.model';

@Injectable()
export class AuthService {
  private strategy: { [key: symbol]: ISocialAuthStrategy } = {};

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly googleStrategy: GoogleStrategy,
  ) {
    this.strategy[SocialLoginProvider.GOOGLE] = googleStrategy;
  }

  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    return;
  }

  async socialAuth(
    req: Request,
    res: Response,
    provider: SocialLoginProvider,
  ): Promise<{ accessToken: string }> {
    let strategy = this.strategy[provider];

    if (!strategy) {
      throw new NotFoundException('Not Found OAuth Service');
    }

    return strategy.socialAuth(req, res);
  }

  // 요청
  // 구글 분기처리, 구글전략실행
  // 콜백url

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

  async socialWithdraw(
    loginUser: LoginUser,
    socialWithdrawDto: SocialWithdrawDto,
  ): Promise<void> {
    const strategy = this.strategy[socialWithdrawDto.provider];

    if (!strategy) {
      throw new NotFoundException('Not Found OAuth Service');
    }

    return strategy.socailWithdraw(loginUser, socialWithdrawDto);
  }
}
