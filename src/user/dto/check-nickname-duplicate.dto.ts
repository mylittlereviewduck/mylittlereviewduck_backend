import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CheckNicknameDuplicateDto {
  @ApiProperty({
    example: 'nickname',
    description: '2-16자',
  })
  @IsString()
  @Length(2, 16)
  nickname: string;
}
