import { ApiProperty } from '@nestjs/swagger';
import { ReviewEntity } from 'src/review/entity/Review.entity';

export class ReviewPagerbleResponseDto {
  @ApiProperty({ description: '전체 페이지 수', example: 9 })
  totalPage: number;

  @ApiProperty({ description: '현재 페이지(1~totalPage까지 가능)', example: 1 })
  page: number;

  @ApiProperty({
    description: '리뷰리스트',
    isArray: true,
    example: [
      {
        isMyLike: true,
        isMyBookmark: true,
        isMyShare: false,
        isMyBlock: false,
        idx: 41,
        accountIdx: 5,
        title: '모델 X의 화면 해상도',
        content:
          '화면 해상도가 좋아서 영화 볼 때 생생해요. 하지만 무게가 좀 무거워요.',
        tags: [],
        createdAt: '2024-08-06T06:25:28.788Z',
        viewCount: 0,
        likeCount: 1,
        reportCount: 0,
      },
      {
        isMyLike: false,
        isMyBookmark: false,
        isMyShare: false,
        isMyBlock: true,
        idx: 40,
        accountIdx: 4,
        title: '모델 X의 배터리 수명이 짧아요',
        content:
          '사용한 지 몇 달 되지 않았는데, 배터리가 빨리 닳기 시작했어요. 실망입니다.',
        tags: [],
        createdAt: '2024-08-06T06:25:28.788Z',
        viewCount: 0,
        likeCount: 0,
        reportCount: 0,
      },
    ],
  })
  reviews: ReviewEntity[];
}
