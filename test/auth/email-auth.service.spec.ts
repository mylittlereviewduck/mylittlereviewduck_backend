import { Test, TestingModule } from '@nestjs/testing';
import { describe } from 'node:test';
import { SendEmailVerificationDto } from 'src/auth/dto/send-email-verification.dto';
import { EmailAuthService } from 'src/auth/email-auth.service';
import { EmailService } from 'src/email/email.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { userData } from 'test/data/user';
import { MockContext, Context, createMockContext } from './../context';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

const mockEmailService = {
  sendEmail: jest.fn(),
};

const mockUserService = {
  getUser: jest.fn(),
};

const mockPrismaService = createMockContext().prisma;

describe('email auth service', () => {
  let emailAuthService: EmailAuthService;
  let emailService: jest.Mocked<EmailService>;
  let prismaService: jest.Mocked<PrismaService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailAuthService,
        // EmailService,
        // UserService,
        { provide: EmailService, useValue: mockEmailService },
        { provide: UserService, useValue: mockUserService },
        { provide: PrismaService, useValue: mockPrismaService },
        // PrismaService,
      ],
    }).compile();

    emailAuthService = module.get<EmailAuthService>(EmailAuthService);
    //prettier-ignore
    emailService = module.get<EmailService>(EmailService) as jest.Mocked<EmailService>;
    //prettier-ignore
    userService = module.get<UserService>(UserService) as jest.Mocked<UserService>;
    //prettier-ignore
    prismaService = module.get<PrismaService>(PrismaService) as jest.Mocked<PrismaService>
  });

  it('인증번호 이메일 전송 성공', async () => {
    const dto: SendEmailVerificationDto = {
      email: 'test1@a.com',
    };

    userService.getUser.mockResolvedValue(null);

    mockPrismaService.verifiedEmailTb.deleteMany.mockResolvedValue({
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
    const user = userData;

    userService.getUser.mockResolvedValue(user);

    await expect(
      emailAuthService.sendEmailVerificationCode(dto),
    ).rejects.toThrow(ConflictException);
  });
});
