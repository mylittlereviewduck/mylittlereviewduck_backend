import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class CheckNicknameDuplicateDto {
  @ApiProperty({
    example: 'nickname',
    description: '2-10자',
  })
  @IsString()
  @Length(2, 10)
  nickname: string;
}
