import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ example: '댓글 내용' })
  @Length(1, 3000)
  @IsString({})
  content: string;
}
