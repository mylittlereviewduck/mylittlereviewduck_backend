import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ example: 1 })
  reviewIdx: number;

  @ApiProperty({ example: 1 })
  commentIdx: number;

  @ApiProperty({ example: 1 })
  content: string;
}
