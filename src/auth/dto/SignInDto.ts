import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, length } from 'class-validator';

export class SignInDto {
  @ApiProperty({ example: 'example@naver.com', description: '이메일 형식' })
  @IsEmail()
  @Length(2, 20)
  email: string;

  @ApiProperty({ example: 'pw1234', description: '비밀번호' })
  @IsString()
  @Length(2, 10)
  pw: string;
}
