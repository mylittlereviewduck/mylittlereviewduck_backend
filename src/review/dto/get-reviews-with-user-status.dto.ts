import { ReviewTimeframe } from '../type/review-timeframe';

export class GetReviewsWithUserStatusDto {
  size: number;
  page: number;
  timeframe: ReviewTimeframe;
  userIdx?: string;
  loginUserIdx?: string;
}
