import { SignInDto } from './dto/signIn.dto';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { GoogleStrategy } from './strategy/google.strategy';
import { SocialLoginProvider } from './model/social-login-provider.model';

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

  async signIn(signInDto: SignInDto): Promise<{ accessToken: string }> {
    const user = await this.prismaService.accountTb.findFirst({
      where: {
        email: signInDto.email,
        pw: signInDto.pw,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const payload = { idx: user.idx };

    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken };
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
}
