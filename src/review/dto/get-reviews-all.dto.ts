import { ReviewPagerbleDto } from './request/review-pagerble.dto';

export class GetReviewsAllDto extends ReviewPagerbleDto {
  userIdx?: string;

  userIdxs?: string[];

  scoreLte?: number;

  scoreGte?: number;

  following?: string;
}
