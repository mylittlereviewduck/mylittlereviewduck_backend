import { AccountTb, Prisma } from '@prisma/client';
import { createMockContext } from './../context';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from './../../src/auth/bcrypt.service';
import { EmailAuthService } from './../../src/auth/email-auth.service';
import { PrismaService } from './../../src/prisma/prisma.service';
import { GetUserDto } from './../../src/user/dto/get-user.dto';
import { UserService } from './../../src/user/user.service';
import { getUserData } from './../../test/data/get-user.data';
import { UserEntity } from 'src/user/entity/User.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { userEntityData } from 'test/data/user.entity.data';
import { ConflictException } from '@nestjs/common';

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
let userService: UserService;

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

  it('getUser 성공', async () => {
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

  it('createUser 실패: ConflictException 반환', async () => {
    const dto: CreateUserDto = {
      email: 'test1@a.com',
      pw: '1234',
    };

    const userData = getUserData;

    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (callback) => {
        const txMock = {
          accountTb: {
            create: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn().mockResolvedValue(userData),
          },
        } as unknown as Prisma.TransactionClient;

        return callback(txMock);
      });

    await expect(userService.createUser(dto)).rejects.toThrow(
      ConflictException,
    );
  });
});
