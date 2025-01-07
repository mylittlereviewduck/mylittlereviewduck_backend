import { ApiProperty } from '@nestjs/swagger';
import { GetReviewsDto } from './get-reviews.dto';
import { IsUUID } from 'class-validator';

export class GetReviewsWithLoginUserDto extends GetReviewsDto {
  @ApiProperty({ description: '로그인한 유저 식별자 (UUID)' })
  @IsUUID()
  loginUserIdx: string | null;
}
