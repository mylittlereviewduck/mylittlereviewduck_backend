import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: '123456', description: '인증번호 6자리' })
  @IsInt()
  code: number;

  @ApiProperty({ example: 'example@naver.com', description: '인증 이메일' })
  @IsEmail()
  email: string;
}
