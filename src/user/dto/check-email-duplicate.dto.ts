import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length } from 'class-validator';

export class CheckEmailDuplicateDto {
  @ApiProperty({
    example: 'abc123@naver.com',
    description: '2-20자, 이메일 양식을 맞춰야합니다.',
  })
  @IsEmail()
  @Length(2, 20)
  email: string;
}
