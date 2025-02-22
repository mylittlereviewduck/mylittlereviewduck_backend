import { PagerbleDto } from 'src/user/dto/pagerble.dto';
import { ReviewTimeframe } from '../type/review-timeframe';
export class GetScoreReviewsDto extends PagerbleDto {
  timeframe?: ReviewTimeframe = 'all';
  scoreLte?: number;
  scoreGte?: number;
}
