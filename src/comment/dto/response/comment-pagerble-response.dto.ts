import { ApiProperty } from '@nestjs/swagger';
import { CommentEntity } from 'src/comment/entity/Comment.entity';

export class CommentPagerbleResponseDto {
  @ApiProperty({ example: 10, description: '전체 페이지 수' })
  totalPage: number;

  @ApiProperty({
    description: '댓글 리스트',
    isArray: true,
    type: CommentEntity,
    example: [
      {
        isMyBlock: false,
        isMyLike: false,
        idx: 21,
        userIdx: 'de1704a4-bdd4-4df5-8fe8-053338cbac44',
        reviewIdx: 81,
        commentIdx: null,
        content: '대댓글 내용입니다내용입니다22222',
        createdAt: '2024-08-18T08:25:28.103Z',
      },
      {
        isMyBlock: false,
        isMyLike: true,
        idx: 22,
        userIdx: 'de1704a4-bdd4-4df5-8fe8-053338cbac44',
        reviewIdx: 81,
        commentIdx: null,
        content: '대댓글 내용입니다내용입니다33333',
        createdAt: '2024-08-18T08:25:31.818Z',
      },
    ],
  })
  comments: CommentEntity[];
}
