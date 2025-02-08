import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { ReviewPagerbleDto } from './review-pagerble.dto';

export class GetReviewsDto extends ReviewPagerbleDto {
  @ApiProperty({ description: '작성자 식별자 (UUID)' })
  @IsOptional()
  @IsUUID()
  userIdx?: string;

  @ApiProperty({ description: '작성자 목록 (UUID 배열)' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  userIdxs?: string[];
}
