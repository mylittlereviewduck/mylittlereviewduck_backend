import { PrismaService } from 'src/prisma/prisma.service';
import { SendEmailVerificationDto } from './dto/send-email-verification.dto';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { UserService } from 'src/user/user.service';
import { EmailVerificaitonTb, Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class EmailAuthService {
  constructor(
    private readonly emailService: EmailService,
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async inspectEmailDuplicate(email: string): Promise<void> {
    const user = await this.userService.getUser({
      email: email,
    });

    if (user) {
      throw new ConflictException('Duplicated Email');
    }

    const verificationCode = await this.createEmailVerification(email);

    await this.emailService.sendEmail({
      toEmail: email,
      title: `오늘도 리뷰 이메일 인증번호`,
      content: `이메일 인증번호 : ${verificationCode}`,
    });
  }

  async inspectEmail(email: string): Promise<void> {
    const user = await this.userService.getUser({
      email: email,
    });

    if (!user) {
      throw new NotFoundException('Not Found Email');
    }

    const verificationCode = await this.createEmailVerification(email);

    await this.emailService.sendEmail({
      toEmail: email,
      title: `오늘도 리뷰 이메일 인증번호`,
      content: `이메일 인증번호 : ${verificationCode}`,
    });
  }

  async getEmailVerification(
    email: string,
    verificationCode?: number,
    tx?: Prisma.TransactionClient,
  ): Promise<EmailVerificaitonTb | null> {
    const prisma = tx ?? this.prismaService;

    return await prisma.emailVerificaitonTb.findUnique({
      where: {
        email: email,
        code: verificationCode,
      },
    });
  }

  async createEmailVerification(
    email: string,
    tx?: PrismaClient,
  ): Promise<number> {
    const code = Math.floor(Math.random() * 900000 + 100000);

    const prismaService = tx ?? this.prismaService;

    await prismaService.emailVerificaitonTb.deleteMany({
      where: {
        email: email,
      },
    });

    await prismaService.emailVerificaitonTb.create({
      data: {
        code: code,
        email: email,
      },
    });

    return code;
  }

  async verifyEmail(email: string): Promise<EmailVerificaitonTb> {
    return await this.prismaService.emailVerificaitonTb.update({
      data: {
        verifiedAt: new Date(),
      },
      where: {
        email: email,
      },
    });
  }

  async deleteEmailVerification(email: string): Promise<void> {
    await this.prismaService.emailVerificaitonTb.delete({
      where: {
        email: email,
      },
    });
  }
}
