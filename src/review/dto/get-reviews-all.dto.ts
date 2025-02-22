import { PagerbleDto } from 'src/user/dto/pagerble.dto';

export class GetReviewsAllDto extends PagerbleDto {
  userIdx?: string;

  userIdxs?: string[];

  scoreLte?: number;

  scoreGte?: number;

  following?: string;
}
