import { SendEmailWithVerificationDto } from '../../auth/dto/SendEmailWithVerification.dto';
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
  ): Promise<void> {
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    this.mailerService.sendMail({
      to: sendEmailWithVerificationDto.email,
      from: process.env.MAIL_USER,
      subject: '오늘도리뷰 인증메일',
      text: `오늘도리뷰 인증번호 : ${verificationCode}`,
      html: `<b>오늘도리뷰 인증번호 : ${verificationCode}</b>`,
    });

    await this.prismaService.verifiedEmailTb.create({
      data: {
        email: sendEmailWithVerificationDto.email,
        code: verificationCode,
      },
    });
  }
}
