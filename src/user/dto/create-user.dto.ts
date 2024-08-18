import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length, Matches } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'abc123@naver.com',
    description: '2-20자, 이메일형식',
  })
  @IsEmail()
  @Length(2, 20)
  email: string;

  @ApiProperty({
    example: 'pw123!!',
    description: '6-30자의 비밀번호, 문자, 숫자, 특수문자 포함',
  })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).{6,30}$/, {
    message:
      '비밀번호는 6-30자로 구성되며, 문자, 숫자, 특수문자를 반드시 포함해야합니다.',
  })
  @Length(6, 30)
  pw: string;
}
