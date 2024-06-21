import { Request, Response } from 'express';
import { Test } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { GoogleStrategy } from './../auth/strategy/google.strategy';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UserModule } from '../../src/user/user.module';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../src/user/user.service';
import { SocialLoginProvider } from './model/social-login-provider.model';
import { NaverStrategy } from './strategy/naver.strategy';
import { KakaoStrategy } from './strategy/kakao.strategy';
import { AppleStrategy } from './strategy/apple.strategy';
import { NotFoundException } from '@nestjs/common';

describe('authService', () => {
  let authService: AuthService;
  let googleStrategy: GoogleStrategy;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let naverStrategy: NaverStrategy;
  let kakaoStrategy: NaverStrategy;
  let appleStrategy: NaverStrategy;
  let userModule: UserModule;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        GoogleStrategy,
        JwtService,
        PrismaService,
        ConfigService,
        NaverStrategy,
        KakaoStrategy,
        AppleStrategy,
        {
          provide: HttpService,
          useValue: {},
        },
        UserService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
    googleStrategy = module.get<GoogleStrategy>(GoogleStrategy);
    naverStrategy = module.get<NaverStrategy>(NaverStrategy);
    kakaoStrategy = module.get<KakaoStrategy>(KakaoStrategy);
    appleStrategy = module.get<AppleStrategy>(AppleStrategy);
  });

  //getToken메서드의 테스트 역할
  // -> if문이 성공했을때 getTokenRequest가 성공하는지
  // -> if문이 실패했을때 에러 반환이 잘되는지

  //기존의 getToken메서드의 테스트는 각각의 if문마다 테스트케이스를 1개씩 추가했어야했다

  it('getToken success', async () => {
    let req: Request;
    let res: Response;
    const provider = SocialLoginProvider.GOOGLE;

    const loginMock = jest
      .spyOn(googleStrategy, 'getTokenRequest')
      .mockResolvedValue();

    await authService.getToken(req, res, provider);

    expect(loginMock).toHaveBeenCalled();
  });

  it('getToken fail', async () => {
    let req: Request;
    let res: Response;
    const provider = 'test' as SocialLoginProvider;

    const loginMock = jest
      .spyOn(googleStrategy, 'getTokenRequest')
      .mockResolvedValue();

    expect(authService.getToken(req, res, provider)).rejects.toThrow(
      NotFoundException,
    );
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('login google', async () => {
    let req: Request;
    let res: Response;
    const provider = SocialLoginProvider.GOOGLE;

    const loginMock = jest
      .spyOn(googleStrategy, 'getTokenRequest')
      .mockResolvedValue();

    authService.getToken(req, res, provider);

    expect(loginMock).toHaveBeenCalled();
  });

  it('login naver', async () => {
    let req: Request;
    let res: Response;
    const provider = SocialLoginProvider.NAVER;

    const loginMock = jest
      .spyOn(naverStrategy, 'getTokenRequest')
      .mockResolvedValue();

    authService.getToken(req, res, provider);

    expect(loginMock).toHaveBeenCalled();
  });

  it('login kakao', async () => {
    let req: Request;
    let res: Response;
    const provider = SocialLoginProvider.KAKAO;

    const loginMock = jest
      .spyOn(kakaoStrategy, 'getTokenRequest')
      .mockResolvedValue();

    authService.getToken(req, res, provider);

    expect(loginMock).toHaveBeenCalled();
  });

  it('login apple', async () => {
    let req: Request;
    let res: Response;
    const provider = SocialLoginProvider.APPLE;

    const loginMock = jest
      .spyOn(appleStrategy, 'getTokenRequest')
      .mockResolvedValue();

    authService.getToken(req, res, provider);

    expect(loginMock).toHaveBeenCalled();
  });

  it('login fail', async () => {
    let req: Request;
    let res: Response;

    const provider = 'test' as SocialLoginProvider;

    const appleLoginMock = jest
      .spyOn(appleStrategy, 'getTokenRequest')
      .mockResolvedValue();

    const naverLoginMock = jest
      .spyOn(naverStrategy, 'getTokenRequest')
      .mockResolvedValue();

    const kakaoLoginMock = jest
      .spyOn(kakaoStrategy, 'getTokenRequest')
      .mockResolvedValue();

    const googleLoginMock = jest
      .spyOn(googleStrategy, 'getTokenRequest')
      .mockResolvedValue();

    expect(authService.getToken(req, res, provider)).rejects.toThrow(
      NotFoundException,
    );
    expect(appleLoginMock).not.toHaveBeenCalled();
    expect(naverLoginMock).not.toHaveBeenCalled();
    expect(kakaoLoginMock).not.toHaveBeenCalled();
    expect(googleLoginMock).not.toHaveBeenCalled();
  });
});
