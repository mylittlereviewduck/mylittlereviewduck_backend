import { ReviewPagerbleDto } from './request/review-pagerble.dto';

export class GetReviewsDto extends ReviewPagerbleDto {
  userIdx?: string;

  userIdxs?: string[];
}
