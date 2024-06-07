import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt } from 'class-validator';

export class SendEmailWithVerificationDto {
  @ApiProperty({
    example: 'example@naver.com',
    description: '인증할 사용자 이메일',
  })
  @IsEmail()
  email: string;
}
