import { ReviewEntity } from 'src/review/entity/Review.entity';

export class ReviewPagerbleResponseDto {
  reviews: ReviewEntity[];

  totalPage: number;

  page: number;
}
