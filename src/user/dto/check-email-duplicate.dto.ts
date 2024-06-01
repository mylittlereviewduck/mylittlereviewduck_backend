import { ApiProperty } from '@nestjs/swagger';

export class CheckEmailDuplicateDto {
  @ApiProperty({
    example: 'abc123@naver.com',
    description: '이메일입니다. 이메일 양식을 맞춰야합니다.',
  })
  email: string;

  pw: string;
}
