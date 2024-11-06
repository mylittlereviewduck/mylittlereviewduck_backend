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
        viewCount: 0,
        likeCount: 4,
        dislikeCount: 6,
        bookmarkCount: 2,
        shareCount: 0,
        commentCount: 0,
        isMyLike: false,
        isMyDislike: false,
        isMyBookmark: false,
        isMyShare: false,
        isMyBlock: false,
        idx: 9827,
        user: {
          idx: '6f1f513d-d634-400c-ae47-11ef0b40e9b4',
          email: 'test7@a.com',
          nickname: '29번째 오리',
          profileImg: null,
          interest1: null,
          interest2: null,
        },
        title: 'Test Review Title 9726',
        content: 'This is review number 9726',
        score: 1,
        tags: [
          'Test Tag 1',
          'Test Tag 2',
          'Test Tag 3',
          'Test Tag 4',
          'Test Tag 5',
        ],
        thumbnail: null,
        thumbnailContent: null,
        images: [],
        imgContent: [],
        createdAt: '2024-08-25T04:25:54.425Z',
        updatedAt: null,
      },
      {
        viewCount: 0,
        likeCount: 4,
        dislikeCount: 4,
        bookmarkCount: 1,
        shareCount: 1,
        commentCount: 0,
        isMyLike: false,
        isMyDislike: false,
        isMyBookmark: false,
        isMyShare: false,
        isMyBlock: false,
        idx: 9802,
        user: {
          idx: '6f1f513d-d634-400c-ae47-11ef0b40e9b4',
          email: 'test7@a.com',
          nickname: '29번째 오리',
          profileImg: null,
          interest1: null,
          interest2: null,
        },
        title: 'Test Review Title 9701',
        content: 'This is review number 9701',
        score: 5,
        tags: [
          'Test Tag 1',
          'Test Tag 2',
          'Test Tag 3',
          'Test Tag 4',
          'Test Tag 5',
        ],
        thumbnail: null,
        thumbnailContent: null,
        images: [],
        imgContent: [],
        createdAt: '2024-08-25T04:25:54.425Z',
        updatedAt: null,
      },
    ],
  })
  reviews: ReviewEntity[];
}
