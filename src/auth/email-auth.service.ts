import { PrismaService } from 'src/prisma/prisma.service';
import { SendEmailVerificationDto } from './dto/send-email-verification.dto';
import {
  ConflictException,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { UserService } from 'src/user/user.service';
import { Prisma, VerifiedEmailTb } from '@prisma/client';

@Injectable()
export class EmailAuthService {
  constructor(
    private readonly emailService: EmailService,
    private readonly prismaService: PrismaService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async sendEmailVerificationCode(
    sendEmailVerificationDto: SendEmailVerificationDto,
  ): Promise<void> {
    const user = await this.userService.getUser({
      email: sendEmailVerificationDto.email,
    });

    if (user) {
      throw new ConflictException('Duplicated Email');
    }

    const code = Math.floor(Math.random() * 900000 + 100000);

    await this.prismaService.verifiedEmailTb.deleteMany({
      where: {
        email: sendEmailVerificationDto.email,
      },
    });

    await this.prismaService.verifiedEmailTb.create({
      data: {
        code: code,
        email: sendEmailVerificationDto.email,
      },
    });

    await this.emailService.sendEmail({
      toEmail: sendEmailVerificationDto.email,
      title: `오늘도 리뷰 이메일 인증번호`,
      content: `이메일 인증번호 : ${code}`,
    });
  }

  async getEmailWithVerificationCode(
    email: string,
    verificationCode?: number,
    tx?: Prisma.TransactionClient,
  ): Promise<VerifiedEmailTb | null> {
    const prisma = tx ?? this.prismaService;

    return await prisma.verifiedEmailTb.findUnique({
      where: {
        email: email,
        code: verificationCode,
      },
    });
  }

  async verifyEmail(email: string): Promise<VerifiedEmailTb> {
    return await this.prismaService.verifiedEmailTb.update({
      data: {
        isVerified: true,
      },
      where: {
        email: email,
      },
    });
  }

  async deleteVerifiedEmail(email: string): Promise<void> {
    await this.prismaService.verifiedEmailTb.delete({
      where: {
        email: email,
      },
    });
  }
}
