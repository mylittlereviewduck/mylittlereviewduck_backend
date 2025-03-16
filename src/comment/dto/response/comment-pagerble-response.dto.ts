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
        idx: 71,
        user: {
          idx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
          email: 'test1@a.com',
          nickname: '23번째 오리',
          profileImg: 'default_img',
          interest1: null,
          interest2: null,
        },
        reviewIdx: 10102,
        commentIdx: null,
        content: '대댓글 내용입니다내용입니다33333',
        tagUsers: [
          {
            idx: 'a3a066c8-845a-41d5-9862-54ea1a918a29',
            email: 'test2@a.com',
            nickname: 'nickname1',
            profileImg: null,
            interest1: '스포츠',
            interest2: '여행',
          },
          {
            idx: '14e8f257-27fa-4999-a723-84a3927e3d5b',
            email: 'test3@a.com',
            nickname: '25번째 오리',
            profileImg: null,
            interest1: null,
            interest2: null,
          },
        ],
        createdAt: '2024-08-25T05:24:33.531Z',
        updatedAt: null,
        deletedAt: null,
      },
      {
        isMyBlock: false,
        isMyLike: false,
        idx: 72,
        user: {
          idx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
          email: 'test1@a.com',
          nickname: '23번째 오리',
          profileImg: 'default_img',
          interest1: null,
          interest2: null,
        },
        reviewIdx: 10102,
        commentIdx: null,
        content: '수정된내용입니다',
        createdAt: '2024-08-25T05:28:43.200Z',
        updatedAt: null,
        deletedAt: null,
      },
    ],
  })
  comments: CommentEntity[];
}
