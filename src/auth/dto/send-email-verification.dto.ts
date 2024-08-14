import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, Length } from 'class-validator';

export class SendEmailVerificationDto {
  @ApiProperty({
    example: 'example@naver.com',
    description: '인증할 사용자 이메일',
  })
  @IsEmail()
  @Length(2, 30)
  email: string;
}
