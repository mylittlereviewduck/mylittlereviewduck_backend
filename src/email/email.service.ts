import { SendEmailDto } from './dto/send-email.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(sendEmailDto: SendEmailDto): Promise<void> {
    this.mailerService.sendMail({
      to: sendEmailDto.toEmail,
      from: this.configService.get<string>('MAIL_USER'),
      subject: sendEmailDto.title,
      text: sendEmailDto.content,
      html: `<b> ${sendEmailDto.content} </b>`,
    });
  }
}
