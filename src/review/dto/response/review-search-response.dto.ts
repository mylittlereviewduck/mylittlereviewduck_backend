import { ApiProperty } from '@nestjs/swagger';
import { ReviewEntity } from 'src/review/entity/Review.entity';

export class ReviewSearchResponseDto {
  @ApiProperty({
    example: `[
    {
        "idx": 19,
        "accountIdx": 1,
        "title": "리뷰제목",
        "content": "리뷰내용",
        "viewCount": 0,
        "likeCount": 0,
        "tags": [
            "태그1",
            "태그2",
            "태그3"
        ],
        "createdAt": "2024-08-01T07:58:57.844Z"
    }
]`,
    isArray: true,
  })
  reviews: ReviewEntity[];

  @ApiProperty({ example: 10, description: '최대 페이지수' })
  totalPage: number;
}
