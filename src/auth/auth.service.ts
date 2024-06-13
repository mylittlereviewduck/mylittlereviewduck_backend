import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { ISocialAuthStrategy } from './interface/social-auth-strategy.interface';
import { SocialAuthDto } from './dto/social-auth.dto';
import { SocialWithdrawDto } from './dto/social-withdraw.dto';
import { GoogleStrategy } from './strategy/google.strategy';

@Injectable()
export class AuthService {
  private strategy: { [key: string]: ISocialAuthStrategy } = {};

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly googleStrategy: GoogleStrategy,
  ) {
    this.strategy['google'] = googleStrategy;
  }

  // signIn: (signInDto: SignInDto) => Promise<{ accessToken: string }> = async (
  //   signInDto,
  // ) => {
  //   const userData = await this.prismaService.accountTb.findUnique({
  //     where: { email: signInDto.email, pw: signInDto.pw },
  //   });

  //   const accessToken = await this.jwtService.signAsync({});

  //   return { accessToken };
  // };

  // //req, res??
  // signInOAuth: (req: Request, res: Response) => Promise<string> = async (
  //   req,
  //   res,
  // ) => {
  //   const { email } = req.user;

  //   let user = await this.userService.getUserByEmail(email);

  //   if (!user) {
  //     user = await this.userService.signUpOAuth({
  //       email: req.user.email,
  //       provider: req.user.provider,
  //       providerKey: req.user.providerKey,
  //     });
  //   }

  //   const payload = { idx: user.idx };
  //   return await this.jwtService.signAsync(payload);
  // };
  // 카카오 로그인을 추가한다. -> 기존 서비스 메서드 구현체가 변경되거나 서비스 클래스 메서드가 추가된다면... 그것은 개방 폐쇄 원칙을 위반함

  // 1. 인터페이스에 새로운 메서드 추가하기 -> 인터페이스 파일을 건드려야함, 구현체가 몇개있는데?
  // 2. 기존 메서드 내용 더 풍부하게 만들기 -> 메서드 내용물을 건드려야함, 테스트 코드가 깨지진 않는지 그리고 다른 기존에 작동하던 컨트롤러는 정상적으로 작동하는지

  // -> 인터페이스도 안깨지고 기존 메서드 내용물도 전혀 변경이 없도록 만들고싶다.
  // -> 새로운 service 구현체를 만든다.

  async socialAuth(
    req: Request,
    social: string,
    socialAuthDto: SocialAuthDto,
  ): Promise<{ accessToken: string }> {
    let strategy = this.strategy[social];

    if (!strategy) {
      throw new NotFoundException('Not Found OAuth Service');
    }

    return strategy.socialAuth(req, social, socialAuthDto);
  }

  async socialWithdraw(
    accessToken: string,
    social: string,
    socialWithdrawDto: SocialWithdrawDto,
  ): Promise<void> {
    const strategy = this.strategy[social];

    if (!strategy) {
      throw new NotFoundException('Not Found OAuth Service');
    }

    return;
  }
}
