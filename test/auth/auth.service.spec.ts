import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './../../src/auth/auth.service';
import { UserService } from './../../src/user/user.service';
import { PrismaService } from './../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BcryptService } from './../../src/auth/bcrypt.service';
import { GoogleStrategy } from './../../src/auth/strategy/google.strategy';
import { NaverStrategy } from './../../src/auth/strategy/naver.strategy';
import { KakaoStrategy } from './../../src/auth/strategy/kakao.strategy';
import { LoginDto } from './../../src/auth/dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';
import { userData } from './../data/user';

// 자동모킹
// jest.mock('./../../src/user/user.service');
// jest.mock('./../../src/auth/bcrypt.service');

const mockUserService = {
  getUser: jest.fn(),
  getUserPasswordByIdx: jest.fn(),
};

const mockBcryptService = {
  compare: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('AuthService test', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let bcryptService: jest.Mocked<BcryptService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: BcryptService, useValue: mockBcryptService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: {} },
        { provide: GoogleStrategy, useValue: {} },
        { provide: NaverStrategy, useValue: {} },
        { provide: KakaoStrategy, useValue: {} },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    //prettier-ignore
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
    //prettier-ignore
    bcryptService = module.get<BcryptService>(BcryptService) as jest.Mocked<BcryptService>;
    //prettier-ignore
    jwtService = module.get<JwtService>(JwtService) as jest.Mocked<JwtService>;
    //prettier-ignore
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      pw: 'password123',
    };

    it('로그인 성공시 액세스토큰, 리프레쉬토큰 반환', async () => {
      const mockUser = userData;
      const mockPassword = 'hashedPassword';

      userService.getUser.mockResolvedValue(mockUser);
      userService.getUserPasswordByIdx.mockResolvedValue(mockPassword);
      bcryptService.compare.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('mockedToken');

      const result = await authService.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(userService.getUser).toHaveBeenCalledWith({
        email: loginDto.email,
      });
      expect(userService.getUserPasswordByIdx).toHaveBeenCalledWith(
        mockUser.idx,
      );
      expect(bcryptService.compare).toHaveBeenCalledWith(
        loginDto.pw,
        mockPassword,
      );
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('유저가 없다면 unauthorizedException 반환', async () => {
      userService.getUser.mockReturnValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('비밀번호 불일치시 unauthorizedException 반환', async () => {
      const mockUser = userData;
      const mockPassword = 'hashedPassword';

      userService.getUser.mockResolvedValue(mockUser);
      userService.getUserPasswordByIdx.mockResolvedValue(mockPassword);
      bcryptService.compare.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(userService.getUserPasswordByIdx).toHaveBeenCalledWith(
        mockUser.idx,
      );
      expect(bcryptService.compare).toHaveBeenCalledWith(
        loginDto.pw,
        mockPassword,
      );
      expect(userService.getUser).toHaveBeenCalledWith({
        email: loginDto.email,
      });
    });
  });
});
