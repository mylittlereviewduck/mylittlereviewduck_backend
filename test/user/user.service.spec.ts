import { createMockContext } from './../context';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from './../../src/auth/bcrypt.service';
import { EmailAuthService } from './../../src/auth/email-auth.service';
import { PrismaService } from './../../src/prisma/prisma.service';
import { GetUserDto } from './../../src/user/dto/get-user.dto';
import { UserService } from './../../src/user/user.service';
import { getUserData } from './../../test/data/get-user.data';
import { userEntityData } from './../../test/data/user.entity.data';
import { UserEntity } from 'src/user/entity/User.entity';

const mockEmailAuthService = {
  getEmailWithVerificationCode: jest.fn(),
  deleteVerifiedEmail: jest.fn(),
};

const mockBcryptService = {
  genSalt: jest.fn(),
  hash: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};
const mockPrismaService = createMockContext().prisma;

describe('user service test', () => {
  let userService: UserService;
  let prismaService: jest.Mocked<PrismaService>;
  let bcryptService: jest.Mocked<BcryptService>;
  let emailAuthService: jest.Mocked<EmailAuthService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: BcryptService, useValue: mockBcryptService },
        { provide: EmailAuthService, useValue: mockEmailAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    //prettier-ignore
    prismaService = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>;
    //prettier-ignore
    emailAuthService = module.get<EmailAuthService>(EmailAuthService) as jest.Mocked<EmailAuthService>;
    //prettier-ignore
    configService = module.get<ConfigService>(ConfigService) as jest.Mocked<ConfigService>;
    //prettier-ignore
    bcryptService = module.get<BcryptService>(BcryptService) as jest.Mocked<BcryptService>;
  });

  afterEach(() => {
    // 각 테스트 이후에는 모의 함수 호출 기록 등을 리셋
    jest.clearAllMocks();
  });

  it('getUser UserEntity 반환', async () => {
    const dto: GetUserDto = {
      email: 'test1@a.com',
    };
    const userData = getUserData;
    mockPrismaService.accountTb.findFirst.mockResolvedValue(userData);

    const result = await userService.getUser(dto);

    expect(result).toBeInstanceOf(UserEntity);
  });

  it('getUser null 반환', async () => {
    const dto: GetUserDto = {
      email: 'test1@a.com',
    };
    mockPrismaService.accountTb.findFirst.mockResolvedValue(null);

    await expect(userService.getUser(dto)).resolves.toEqual(null);
  });
});
