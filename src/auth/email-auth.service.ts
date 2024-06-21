import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { SendEmailVerificationDto } from './dto/send-email-verification.dto';
import { Injectable } from '@nestjs/common';
import { MailService } from 'src/common/Email/email.service';

@Injectable()
export class EmailAuthService {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly prismaService: PrismaService,
  ) {}

  // 인증번호확인
  checkEmailVerification(): (email: string, code: number) => Promise<boolean> {
    return;
  }

  // 인증된 이메일인지확인
  getVerifiedEmail(): (email: string) => Promise<boolean> {
    return;
  }

  async sendEmailVerificationCode(
    sendEmailVerificationDto: SendEmailVerificationDto,
  ): Promise<void> {
    const code = await this.authService.createVerificationCode();

    await this.prismaService.verifiedEmailTb.create({
      data: {
        code: code,
        email: sendEmailVerificationDto.email,
      },
    });

    await this.mailService.sendEmail({
      toEmail: sendEmailVerificationDto.email,
      title: `오늘도 리뷰 이메일 인증번호`,
      content: `이메일 인증번호 : ${code}`,
    });
  }
}
