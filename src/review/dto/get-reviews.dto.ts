import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { ReviewPagerbleDto } from './request/review-pagerble.dto';

export class GetReviewsDto extends ReviewPagerbleDto {
  userIdx?: string;

  userIdxs?: string[];
}
