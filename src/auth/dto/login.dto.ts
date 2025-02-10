import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'example@naver.com', description: '이메일 형식' })
  @IsEmail()
  @Length(6, 30)
  email: string;

  @ApiProperty({ example: 'pw1234', description: '비밀번호' })
  @IsString()
  @Length(6, 30)
  pw: string;

  @ApiProperty({
    description: 'Fcm 토큰, 앱 로그인 시에만 필요합니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  fcmToken?: string;
}
