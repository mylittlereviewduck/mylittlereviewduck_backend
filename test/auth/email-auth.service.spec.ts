import { Test, TestingModule } from '@nestjs/testing';
import { SendEmailVerificationDto } from './../../src/auth/dto/send-email-verification.dto';
import { EmailAuthService } from './../../src/auth/email-auth.service';
import { EmailService } from './../../src/email/email.service';
import { PrismaService } from './../../src/prisma/prisma.service';
import { UserService } from './../../src/user/user.service';
import { createMockContext } from './../context';
import { ConflictException } from '@nestjs/common';
import { userEntityData } from './../../test/data/user.entity.data';

const mockEmailService = {
  sendEmail: jest.fn(),
};

const mockUserService = {
  getUser: jest.fn(),
};

const prismaService = createMockContext().prisma;

describe('email auth service', () => {
  let emailAuthService: EmailAuthService;
  let emailService: jest.Mocked<EmailService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailAuthService,
        { provide: EmailService, useValue: mockEmailService },
        { provide: UserService, useValue: mockUserService },
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    emailAuthService = module.get<EmailAuthService>(EmailAuthService);
    //prettier-ignore
    emailService = module.get<EmailService>(EmailService) as jest.Mocked<EmailService>;
    //prettier-ignore
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
  });

  afterEach(() => {
    // 각 테스트 이후에는 모의 함수 호출 기록 등을 리셋
    jest.clearAllMocks();
  });

  it('인증번호 이메일 전송 성공', async () => {
    const dto: SendEmailVerificationDto = {
      email: 'test1@a.com',
    };

    userService.getUser.mockResolvedValue(null);

    prismaService.verifiedEmailTb.deleteMany.mockResolvedValue({
      count: 1,
    });

    await emailAuthService.sendEmailVerificationCode(dto);

    expect(emailService.sendEmail).toHaveBeenCalledTimes(1);
    expect(userService.getUser).toHaveBeenCalledWith({ email: dto.email });
  });

  it('인증번호 이메일 전송 실패: 중복 이메일', async () => {
    const dto: SendEmailVerificationDto = {
      email: 'test1@a.com',
    };
    const user = userEntityData;

    userService.getUser.mockResolvedValue(user);

    await expect(
      emailAuthService.sendEmailVerificationCode(dto),
    ).rejects.toThrow(ConflictException);
  });
});
