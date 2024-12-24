import { AuthService } from './../../src/auth/auth.service';
import httpMocks from 'node-mocks-http';
import { loginData } from './data/login-dto';
import { userData } from './data/user';
import { Test } from '@nestjs/testing';
import { BcryptService } from 'src/auth/bcrypt.service';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('authService Test', () => {
  let req, res, next;
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let bcryptService: jest.Mocked<BcryptService>;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    req = httpMocks.createRequest;
    res = httpMocks.createResponse;
    next = null;

    const module = await Test.createTestingModule({
      providers: [
        PrismaService,
        AuthService,
        PrismaService,
        {
          provide: BcryptService,
          useValue: {
            compare: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            getUser: jest.fn(),
            generateToken: jest.fn(),
            getUserPasswordByIdx: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    //prettier-ignore
    prismaService = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
    //prettier-ignore
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
    //prettier-ignore
    bcryptService = module.get<BcryptService>(BcryptService) as jest.Mocked<BcryptService>;
  });

  describe('authService login', () => {
    beforeEach(() => {
      req.body = loginData;
    });

    it('should return two tokens', async () => {
      console.log(req.body);

      const loginDto = loginData;
      const hashedPassword = 'hashedPassword';
      const user = userData;

      userService.getUser.mockResolvedValue(user);
      userService.getUserPasswordByIdx.mockResolvedValue(hashedPassword);
      bcryptService.compare.mockResolvedValue(true);

      const result = await authService.login(req.body);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(bcryptService.compare).toHaveBeenCalledTimes(1);
      expect(bcryptService.compare).toBeCalledWith(loginDto.pw, hashedPassword);
      expect(userService.getUser).toBeCalledWith({ email: loginDto.email });
    });
  });
});
