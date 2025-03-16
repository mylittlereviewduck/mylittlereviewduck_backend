import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: 1,
    description: '대댓글의 경우 존재, 댓글idx',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  commentIdx: number | null;

  @ApiProperty({
    example: [
      'a3a066c8-845a-41d5-9862-54ea1a918a29',
      '14e8f257-27fa-4999-a723-84a3927e3d5b',
    ],
    description: '유저태그 시 존재, 유저idx list',
    required: false,
    nullable: true,
  })
  @IsArray()
  @IsUUID(4, { each: true })
  @ArrayMaxSize(10)
  @IsOptional()
  userIdxs?: string[];

  @ApiProperty({ example: '댓글 내용' })
  @Length(1, 3000)
  @IsString()
  content: string;

  reviewIdx?: number;
}
