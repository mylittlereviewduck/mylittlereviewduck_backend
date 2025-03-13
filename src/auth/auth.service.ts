import { LoginDto } from './dto/login.dto';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { UserService } from '../../src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { GoogleStrategy } from './strategy/google.strategy';
import { SocialLoginProvider } from './model/social-login-provider.model';
import { NaverStrategy } from './strategy/naver.strategy';
import { KakaoStrategy } from './strategy/kakao.strategy';
import { LoginResponseDto } from '../../src/auth/dto/response/login-response.dto';
import { BcryptService } from './bcrypt.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  private strategy = {};

  constructor(
    @Inject(forwardRef(() => UserService)) // forwardRef를 사용하여 순환 참조 해결
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
    private readonly prismaService: PrismaService,
    private readonly googleStrategy: GoogleStrategy,
    private readonly naverStrategy: NaverStrategy,
    private readonly kakaoStrategy: KakaoStrategy,
  ) {
    this.strategy[SocialLoginProvider.GOOGLE] = googleStrategy;
    this.strategy[SocialLoginProvider.NAVER] = naverStrategy;
    this.strategy[SocialLoginProvider.KAKAO] = kakaoStrategy;
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userService.getUser({
      email: dto.email,
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const userPw = await this.userService.getUserPasswordByIdx(user.idx);
    const isMatch = await this.bcryptService.compare(dto.pw, userPw);

    if (!isMatch) {
      throw new ConflictException('Invalid password');
    }

    //액세스 토큰 30분
    //리프레쉬 토큰 2주
    const accessToken = await this.generateToken(
      'access',
      user.idx,
      user.isAdmin,
      30 * 60,
    );
    const refreshToken = await this.generateToken(
      'refresh',
      user.idx,
      user.isAdmin,
      14 * 24 * 3600,
    );

    await this.prismaService.loginUserTb.upsert({
      where: {
        accountIdx: user.idx,
      },
      create: {
        accountIdx: user.idx,
        refreshToken: refreshToken,
      },
      update: {
        refreshToken: refreshToken,
        createdAt: new Date(),
      },
    });

    return { accessToken, refreshToken };
  }

  async logout(loginUserIdx: string): Promise<void> {
    await this.prismaService.loginUserTb.delete({
      where: {
        accountIdx: loginUserIdx,
      },
    });
  }

  async generateToken(
    type: 'access' | 'refresh',
    userIdx: string,
    isAdmin: boolean,
    exp: number,
  ): Promise<string> {
    const payload = {
      idx: userIdx,
      isAdmin: isAdmin,
      type: type,
    };

    const token = this.jwtService.signAsync(payload, { expiresIn: exp });

    return token;
  }

  async getToken(
    req: Request,
    res: Response,
    provider: SocialLoginProvider,
  ): Promise<LoginResponseDto> {
    let strategy = this.strategy[provider];

    if (!strategy) {
      throw new NotFoundException('Not Found OAuth Service');
    }

    return strategy.getTokenRequest(req, res);
  }

  async socialLogin(provider: string, query: any): Promise<LoginResponseDto> {
    let strategy = this.strategy[provider];

    if (!strategy) {
      throw new NotFoundException('Not Found OAuth Service');
    }

    return strategy.socialLogin(query);
  }
}
