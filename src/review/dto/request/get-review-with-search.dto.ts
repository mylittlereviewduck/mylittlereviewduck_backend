import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { GetReviewsDto } from '../get-reviews.dto';

export class GetReviewsWithSearchDto extends GetReviewsDto {
  @ApiProperty({
    description: '검색키워드',
  })
  @IsString()
  @Length(2, 100, { message: '검색 글자수 제한 2자-100자' })
  search: string;
}
