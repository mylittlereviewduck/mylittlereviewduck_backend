import { SendEmailWithVerificationDto } from '../../auth/dto/send-email-with-verification.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly prismaService: PrismaService,
  ) {}

  async sendMailWithVerificationCode(
    sendEmailWithVerificationDto: SendEmailWithVerificationDto,
    randomCode: number,
  ): Promise<void> {
    // 인증번호 발송하는 메서드가 가져야하는 책임 AuthService

    this.mailerService.sendMail({
      to: sendEmailWithVerificationDto.email,
      from: process.env.MAIL_USER,
      subject: '오늘도리뷰 인증메일',
      text: `오늘도리뷰 인증번호 : ${randomCode}`,
      html: `<b>오늘도리뷰 인증번호 : ${randomCode}</b>`,
    });

    await this.prismaService.verifiedEmailTb.create({
      data: {
        email: sendEmailWithVerificationDto.email,
        code: randomCode,
      },
    });
  }

  async sendEmail(title: string, contents: string, toEmail: string) {}
}
