import { Equals } from 'class-validator';
import { Prisma, EmailVerificaitonTb } from '@prisma/client';
import { createMockContext } from './../context';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from './../../src/auth/bcrypt.service';
import { EmailAuthService } from './../../src/auth/email-auth.service';
import { PrismaService } from './../../src/prisma/prisma.service';
import { GetUserDto } from './../../src/user/dto/get-user.dto';
import { UserService } from './../../src/user/user.service';
import { testUserData } from '../data/user.data';
import { UserEntity } from 'src/user/entity/User.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserInteractionService } from 'src/user/user-interaction.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { testEmailVerification } from 'test/data/email-verification.entity';
import { testUserTb } from 'test/data/user-tb.data';
import { testUserEntity } from 'test/data/user.entity.data';
import { rejects } from 'assert';

const mockEmailAuthService = {
  getEmailVerification: jest.fn(),
  deleteEmailVerification: jest.fn(),
};

const mockBcryptService = {
  genSalt: jest.fn(),
  hash: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockUserInteractionService = {
  getUserInteraction: jest.fn(),
};

const mockEventEmitter = {
  emit: jest.fn(),
};

const mockPrismaService = createMockContext().prisma;

describe('user service test', () => {
  let userService: UserService;
  let prismaService: jest.Mocked<PrismaService>;
  let bcryptService: jest.Mocked<BcryptService>;
  let emailAuthService: jest.Mocked<EmailAuthService>;
  let configService: jest.Mocked<ConfigService>;
  let userInteractionService: jest.Mocked<UserInteractionService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: BcryptService, useValue: mockBcryptService },
        { provide: EmailAuthService, useValue: mockEmailAuthService },
        { provide: ConfigService, useValue: mockConfigService },
        {
          provide: UserInteractionService,
          useValue: mockUserInteractionService,
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
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
    //prettier-ignore
    userInteractionService = module.get<UserInteractionService>(UserInteractionService) as jest.Mocked<UserInteractionService>
    //prettier-ignore
    eventEmitter = module.get<EventEmitter2>(EventEmitter2) as jest.Mocked<EventEmitter2>
  });

  it('getUser 성공', async () => {
    const dto: GetUserDto = {
      email: 'test1@a.com',
    };
    let userData = testUserData;
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
      confirmPw: '1234s',
    };

    const userData = testUserData;

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

  it('createUser 실패: UnauthorizedException 반환: 인증 유효시간만료', async () => {
    const dto: CreateUserDto = {
      email: 'test1@a.com',
      pw: '1234',
      confirmPw: '1234s',
    };

    const emailVerification = {
      email: testEmailVerification.email,
      code: testEmailVerification.code,
      createdAt: testEmailVerification.createdAt,
      verifiedAt: new Date(Date.now() - 30 * 60 * 1000),
    };

    emailAuthService.getEmailVerification.mockResolvedValue(emailVerification);

    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (callback) => {
        const txMock = {
          accountTb: {
            create: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn().mockResolvedValue(null),
            findUnique: jest.fn().mockResolvedValue(null),
          },
        } as unknown as Prisma.TransactionClient;

        return callback(txMock);
      });

    await expect(userService.createUser(dto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('createUser 실패: UnauthorizedException 반환: 인증부재', async () => {
    const dto: CreateUserDto = {
      email: 'test1@a.com',
      pw: '1234',
      confirmPw: '1234s',
    };

    const emailVerification = {
      email: testEmailVerification.email,
      code: testEmailVerification.code,
      createdAt: testEmailVerification.createdAt,
      verifiedAt: null,
    };

    emailAuthService.getEmailVerification.mockResolvedValue(emailVerification);

    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (callback) => {
        const txMock = {
          accountTb: {
            create: jest.fn(),
            update: jest.fn(),
            findFirst: jest.fn().mockResolvedValue(null),
            findUnique: jest.fn().mockResolvedValue(null),
          },
        } as unknown as Prisma.TransactionClient;

        return callback(txMock);
      });

    await expect(userService.createUser(dto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('createUser 성공', async () => {
    const dto: CreateUserDto = {
      email: 'test1@a.com',
      pw: '1234',
      confirmPw: '1234s',
    };

    const emailVerification = testEmailVerification;
    const userTb = testUserTb;
    const userEntity = testUserEntity;

    emailAuthService.getEmailVerification.mockResolvedValue(emailVerification);

    jest.spyOn(userService, 'getUser').mockResolvedValueOnce(undefined);
    jest.spyOn(userService, 'getUser').mockResolvedValue(userEntity);

    jest
      .spyOn(prismaService, '$transaction')
      .mockImplementation(async (callback) => {
        const txMock = {
          accountTb: {
            create: jest.fn().mockResolvedValue(userTb),
            update: jest.fn().mockResolvedValue({
              email: 'test1@a.com',
              pw: '$2b$10$rM/2QRO85BGgkmyNRcf1s.iQ7ZUvswblKL4gEpYgY0TS3TCKlNSb6',
              nickname: '23번째 오리',
              profile: null,
              provider: 'local',
              providerKey: null,
              createdAt: new Date('2024-08-29T00:58:46.381Z'),
              deletedAt: null,
              idx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
              serialNumber: 23,
              interest1: null,
              interest2: null,
              suspensionCount: 17,
              isAdmin: false,
              suspendExpireAt: null,
              profileImg:
                'https://s3.ap-northeast-2.amazonaws.com/todayreview/1724893124840.png',
            }),
            findFirst: jest.fn().mockResolvedValue(null),
            findUnique: jest.fn().mockResolvedValue(null),
          },
        } as unknown as Prisma.TransactionClient;

        return callback(txMock);
      });

    bcryptService.hash.mockResolvedValue('hashedpw');
    jest.spyOn(emailAuthService, 'deleteEmailVerification');

    const result = await userService.createUser(dto);

    await expect(result).toEqual(userEntity);
    await expect(emailAuthService.deleteEmailVerification).toHaveBeenCalledWith(
      dto.email,
    );
    await expect(userService.getUser).toHaveBeenCalledTimes(2);
  });

  it('비밀번호 변경 : 실패 : 이메일 인증 유효기간 만료 ', async () => {
    const userData = testUserData;

    const emailVerification = {
      email: testEmailVerification.email,
      code: testEmailVerification.code,
      createdAt: testEmailVerification.createdAt,
      verifiedAt: new Date(Date.now() - 15 * 60 * 1000),
    };

    jest
      .spyOn(emailAuthService, 'getEmailVerification')
      .mockResolvedValue(emailVerification);

    await expect(
      userService.updatePassword(userData.email, userData.pw),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('비밀번호 변경 : 실패 : 인증되지않은 이메일 ', async () => {
    const userData = testUserData;

    const emailVerification = null;

    jest
      .spyOn(emailAuthService, 'getEmailVerification')
      .mockResolvedValue(emailVerification);

    await expect(
      userService.updatePassword(userData.email, userData.pw),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('비밀번호 변경 : 실패 : 인증되지않은 이메일 ', async () => {
    const userData = testUserData;

    const emailVerification = {
      email: testEmailVerification.email,
      code: testEmailVerification.code,
      createdAt: testEmailVerification.createdAt,
      verifiedAt: null,
    };

    jest
      .spyOn(emailAuthService, 'getEmailVerification')
      .mockResolvedValue(emailVerification);

    await expect(
      userService.updatePassword(userData.email, userData.pw),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('비밀번호 변경 : 성공', async () => {
    const userData = testUserData;

    const emailVerification = {
      email: testEmailVerification.email,
      code: testEmailVerification.code,
      createdAt: testEmailVerification.createdAt,
      verifiedAt: new Date(Date.now() - 3 * 60 * 1000),
    };

    jest
      .spyOn(emailAuthService, 'getEmailVerification')
      .mockResolvedValue(emailVerification);

    jest.spyOn(bcryptService, 'hash').mockResolvedValue('hashedPw');

    let txMock;
    jest.spyOn(prismaService, '$transaction').mockImplementation((callback) => {
      txMock = {
        EmailVerificaitonTb: {
          findUnique: jest.fn,
          delete: jest.fn,
        },
        accountTb: {
          updateMany: jest.fn,
        },
      } as unknown as Prisma.TransactionClient;
      return callback(txMock);
    });

    jest
      .spyOn(emailAuthService, 'deleteEmailVerification')
      .mockResolvedValue(undefined);

    await userService.updatePassword(userData.email, userData.pw);

    await expect(emailAuthService.deleteEmailVerification).toHaveBeenCalledWith(
      userData.email,
      txMock,
    );
    await expect(
      emailAuthService.deleteEmailVerification,
    ).toHaveBeenCalledTimes(1);
  });

  it('내정보 수정: 실패: 중복 닉네임', async () => {
    const userData = testUserData;
    const userEntity = testUserEntity;

    jest.spyOn(userService, 'getUser').mockResolvedValueOnce(userEntity);
    jest.spyOn(userService, 'getUser').mockResolvedValueOnce(userEntity);

    await expect(
      userService.updateMyinfo(userData.idx, {
        interest: [userData.interest1],
        nickname: userData.nickname,
        profile: userData.profile,
      }),
    ).rejects.toThrow();
  });
});
