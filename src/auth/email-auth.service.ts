import { PrismaService } from 'src/prisma/prisma.service';
import { SendEmailVerificationDto } from './dto/send-email-verification.dto';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { UserService } from 'src/user/user.service';
import { EmailVerificaitonTb, Prisma, PrismaClient } from '@prisma/client';
import { EmailVerificationEntity } from './entity/verified-email.model';

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

    const code = await this.createEmailVerification(email);

    await this.emailService.sendEmail({
      toEmail: email,
      title: `오늘도 리뷰 이메일 인증번호`,
      content: `이메일 인증번호 : ${code}`,
    });
  }

  async inspectEmail(email: string): Promise<void> {
    const user = await this.userService.getUser({
      email: email,
    });

    if (!user) {
      throw new NotFoundException('Not Found Email');
    }

    const code = await this.createEmailVerification(email);

    await this.emailService.sendEmail({
      toEmail: email,
      title: `오늘도 리뷰 이메일 인증번호`,
      content: `이메일 인증번호 : ${code}`,
    });
  }

  async getEmailVerification(
    email: string,
    code?: number,
    tx?: Prisma.TransactionClient,
  ): Promise<EmailVerificationEntity | null> {
    const prisma = tx ?? this.prismaService;

    const emailVerificationData = await prisma.emailVerificaitonTb.findUnique({
      where: {
        email: email,
        ...(code && { code: code }),
      },
    });

    if (!emailVerificationData) {
      return null;
    }

    return new EmailVerificationEntity(emailVerificationData);
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

  async checkEmailVerificationCode(email: string, code: number): Promise<void> {
    const verifiedEmail = await this.getEmailVerification(email, code);

    if (!verifiedEmail) {
      throw new UnauthorizedException('Unauthorized email');
    }

    if (
      new Date().getTime() - verifiedEmail.createdAt.getTime() >
      5 * 60 * 1000
    ) {
      throw new UnauthorizedException('Authentication TimeOut');
    }

    await this.verifyEmail(verifiedEmail.email);
  }
}
