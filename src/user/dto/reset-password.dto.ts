import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsEmail, Length, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    name: 'email',
    example: 'example@abc.com',
    description: '비밀번호를 바꾸려는 메일 계정',
  })
  @IsEmail()
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

  @Equals('pw', { message: '비밀번호와 비밀번호 확인이 일치하지 않습니다.' })
  confirmPw: string;
}
