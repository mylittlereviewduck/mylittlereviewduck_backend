import { ApiProperty } from '@nestjs/swagger';
import { CommentEntity } from 'src/comment/entity/Comment.entity';

export class CommentPagerbleResponseDto {
  @ApiProperty({ example: 10, description: '전체 페이지 수' })
  totalPage: number;

  @ApiProperty({ description: '댓글 리스트', isArray: true, example: [] })
  comments: CommentEntity[];
}
