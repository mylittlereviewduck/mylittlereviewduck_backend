import { ApiProperty } from '@nestjs/swagger';

export class ReviewBookmarkEntity {
  @ApiProperty({
    example: 'de1704a4-bdd4-4df5-8fe8-053338cbac44',
    description: '유저 idx',
  })
  userIdx: string;

  @ApiProperty({ example: 1, description: '리뷰 idx' })
  reviewIdx: number;

  constructor(data) {
    this.userIdx = data.accountIdx;
    this.reviewIdx = data.reviewIdx;
  }
}
