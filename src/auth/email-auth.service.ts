import { PrismaService } from 'src/prisma/prisma.service';
import { AuthService } from './auth.service';
import { SendEmailVerificationDto } from './dto/send-email-verification.dto';
import { Injectable } from '@nestjs/common';
import { MailService } from 'src/email/email.service';

@Injectable()
export class EmailAuthService {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
    private readonly prismaService: PrismaService,
  ) {}

  async sendEmailVerificationCode(
    sendEmailVerificationDto: SendEmailVerificationDto,
  ): Promise<void> {
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

    await this.mailService.sendEmail({
      toEmail: sendEmailVerificationDto.email,
      title: `오늘도 리뷰 이메일 인증번호`,
      content: `이메일 인증번호 : ${code}`,
    });
  }
}
