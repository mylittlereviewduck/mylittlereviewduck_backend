import { ApiProperty } from '@nestjs/swagger';

export class ReviewReportEntity {
  @ApiProperty({ example: 1, description: '유저 idx' })
  userIdx: string;

  @ApiProperty({ example: 1, description: '리뷰 idx' })
  reviewIdx: number;

  constructor(data) {
    this.userIdx = data.accountIdx;
    this.reviewIdx = data.reviewIdx;
  }
}
