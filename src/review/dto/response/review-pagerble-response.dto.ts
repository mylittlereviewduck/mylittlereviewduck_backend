import { ApiProperty } from '@nestjs/swagger';
import { ReviewEntity } from 'src/review/entity/Review.entity';

export class ReviewPagerbleResponseDto {
  @ApiProperty({ example: 9, description: '전체 페이지 수' })
  totalPage: number;

  @ApiProperty({
    description: '리뷰리스트',
    isArray: true,
    type: ReviewEntity,
    example: [
      {
        viewCount: 1,
        likeCount: 0,
        dislikeCount: 0,
        bookmarkCount: 0,
        shareCount: 0,
        reportCount: 0,
        isMyLike: false,
        isMyDislike: false,
        isMyBookmark: false,
        isMyShare: false,
        isMyBlock: false,
        idx: 10102,
        user: {
          isFollowing: false,
          isBlocked: false,
          isReported: false,
          idx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
          email: 'test1@a.com',
          profile: null,
          profileImg: 'default_img',
          nickname: '23번째 오리',
          createdAt: '2024-08-20T11:36:44.732Z',
        },
        title: 'updated title',
        content: 'updated content',
        score: '5',
        tags: [],
        images: ['6'],
        createdAt: '2024-08-22T08:25:32.998Z',
        updatedAt: '2024-08-22T09:15:16.176Z',
      },
      {
        viewCount: 0,
        likeCount: 6,
        dislikeCount: 2,
        bookmarkCount: 2,
        shareCount: 1,
        reportCount: 1,
        isMyLike: false,
        isMyDislike: false,
        isMyBookmark: false,
        isMyShare: false,
        isMyBlock: false,
        idx: 10101,
        user: {
          isFollowing: false,
          isBlocked: false,
          isReported: false,
          idx: 'a0e5f525-727e-4b20-94af-1189d271c57f',
          email: 'test25@a.com',
          profile: null,
          profileImg: 'default_img',
          nickname: '47번째 오리',
          createdAt: '2024-08-21T07:43:09.773Z',
        },
        title: 'Test Review Title 10000',
        content: 'This is review number 10000',
        score: '0',
        tags: [
          'Test Tag 1',
          'Test Tag 2',
          'Test Tag 3',
          'Test Tag 4',
          'Test Tag 5',
        ],
        images: [],
        createdAt: '2024-08-22T03:57:25.220Z',
        updatedAt: null,
      },
    ],
  })
  reviews: ReviewEntity[];
}
