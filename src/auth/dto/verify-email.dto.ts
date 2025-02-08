import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, Length, Max, Min } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: '123456', description: '인증번호 6자리' })
  @IsInt()
  @Min(100000)
  @Max(999999)
  code: number;

  @ApiProperty({ example: 'example@naver.com', description: '인증 이메일' })
  @IsEmail()
  @Length(2, 30)
  email: string;
}
