import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

const report = Prisma.validator<Prisma.ReportTbDefaultArgs>()({});

export type report = Prisma.ReportTbGetPayload<typeof report>;

export class ReportEntity {
  @ApiProperty({ example: 1, description: '신고 식별자' })
  idx: number;

  @ApiProperty({
    example: 'de1704a4-bdd4-4df5-8fe8-053338cbac44',
    description: '유저 idx',
  })
  reporterIdx: string;

  @ApiProperty({ example: 1, description: '신고 타입' })
  type: number;

  @ApiProperty({ example: 1, description: '리뷰 idx' })
  reviewIdx?: number;

  @ApiProperty({ example: 1, description: '댓글 idx' })
  commentIdx?: number;

  @ApiProperty({
    example: '2024-08-01Tq07:58:57.844Z',
    description: '신고 시간',
  })
  createdAt: Date;

  constructor(data: report) {
    this.idx = data.idx;
    this.reporterIdx = data.reporterIdx;
    this.type = data.type;
    this.reviewIdx = data.reviewIdx;
    this.commentIdx = data.commentIdx;
    this.createdAt = data.createdAt;
  }
}
