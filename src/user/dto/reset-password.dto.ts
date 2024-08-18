import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    name: 'email',
    example: 'example@abc.com',
    description: '비밀번호를 바꾸려는 메일 계정',
  })
  @IsEmail()
  email: string;
}
