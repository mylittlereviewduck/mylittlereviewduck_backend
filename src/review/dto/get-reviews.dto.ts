import { PagerbleDto } from 'src/user/dto/pagerble.dto';

export class GetReviewsDto extends PagerbleDto {
  userIdx?: string;

  userIdxs?: string[];
}
