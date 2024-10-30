import { ApiProperty } from '@nestjs/swagger';
import { ReviewEntity } from 'src/review/entity/Review.entity';
import { ReviewListEntity } from 'src/review/entity/ReviewList.entity';

export class ReviewPagerbleResponseDto {
  @ApiProperty({ example: 9, description: '전체 페이지 수' })
  totalPage: number;

  @ApiProperty({
    description: '리뷰리스트',
    isArray: true,
    type: ReviewEntity,
    example: [
      {
        idx: 10118,
        title: '리뷰제목',
        score: 3,
        createdAt: '2024-08-31T04:04:22.711Z',
        user: {
          idx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
          email: 'test1@a.com',
          nickname: '23번째 오리',
        },
        tags: ['tag1', 'tag2'],
        images: ['image1', 'image2', 'image3', 'image4', 'image5', 'image6'],
        likeCount: 0,
        dislikeCount: 0,
        commentCount: 0,
        isMyLike: true,
        isMyDislike: false,
        isMyBlock: false,
      },
      {
        idx: 10117,
        title: '리뷰제목',
        score: 3,
        createdAt: '2024-08-31T04:00:36.784Z',
        user: {
          idx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
          email: 'test1@a.com',
          nickname: '23번째 오리',
        },
        tags: ['tag1', 'tag2'],
        images: ['image1', 'image2', 'image3', 'image4', 'image5', 'image6'],
        likeCount: 0,
        dislikeCount: 0,
        commentCount: 0,
        isMyLike: false,
        isMyDislike: false,
        isMyBlock: true,
      },
    ],
  })
  reviews: ReviewEntity[];
}
