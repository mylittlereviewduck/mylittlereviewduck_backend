import { ReviewTimeframe } from '../type/review-timeframe';
import { ReviewPagerbleDto } from './request/review-pagerble.dto';
export class GetScoreReviewsDto extends ReviewPagerbleDto {
  timeframe?: ReviewTimeframe = 'all';
  scoreLte?: number;
  scoreGte?: number;
}
