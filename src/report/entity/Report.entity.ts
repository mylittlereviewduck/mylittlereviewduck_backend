import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { ReviewUserEntity } from 'src/review/entity/ReviewUser.entity';
import { reportType } from '../type/report.type';

const report = Prisma.validator<Prisma.ReportTbDefaultArgs>()({
  include: {
    accountTb: true,
    reportTypeTb: true,
  },
});

export type report = Prisma.ReportTbGetPayload<typeof report>;

export class ReportEntity {
  @ApiProperty({ example: 1, description: '신고 식별자' })
  idx: number;

  @ApiProperty({
    example: {
      idx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
      email: 'test1@a.com',
      nickname: '23번째 오리',
      profileImg:
        'https://s3.ap-northeast-2.amazonaws.com/todayreview/1724893124840.png',
      interest1: '여행',
      interest2: null,
    },
    description: '작성자',
  })
  user: ReviewUserEntity;

  @ApiProperty({ example: '신고 내용입니다' })
  content: string;

  @ApiProperty({
    example: 'spam',
    description: `신고 타입  
    'spam' | 'ilegal_product' | 'harmful_to_children' | 'sexsual' | 'hate_or_discrimination' | 'offensive' | 'other' 중 하나로 반환됩니다.`,
  })
  type: string;

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
    this.user = new ReviewUserEntity(data.accountTb);
    this.content = data.content;
    this.type = data.reportTypeTb.typeName;
    this.reviewIdx = data.reviewIdx;
    this.commentIdx = data.commentIdx;
    this.createdAt = data.createdAt;
  }
}
