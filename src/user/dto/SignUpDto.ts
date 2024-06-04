import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    example: 'abc123@naver.com',
    description: '2-20자, 이메일형식',
  })
  @IsEmail()
  @Length(2, 20)
  email: string;

  @ApiProperty({ example: 'pw123', description: '2-10자, 비밀번호' })
  @IsString()
  @Length(2, 10)
  pw: string;
}
