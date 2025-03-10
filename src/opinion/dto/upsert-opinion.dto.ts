import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpsertOpinionDto {
  @ApiProperty({
    example: '의견 제목입니다',
    description: '의견 제목',
    required: true,
  })
  @IsString()
  @Length(1, 150)
  title: string;

  @ApiProperty({
    example: '의견 내용입니다',
    description: '의견 내용',
    required: true,
  })
  @IsString()
  @Length(1, 5000)
  content: string;
}
