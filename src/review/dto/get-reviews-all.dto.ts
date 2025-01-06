import { ReviewTimeframe } from '../type/review-timeframe';

export class GetReviewsAllDto {
  page: number = 1;
  size: number = 10;
  timeframe: ReviewTimeframe = 'all';
  userIdx?: string;
  userIdxs?: string[];
}
