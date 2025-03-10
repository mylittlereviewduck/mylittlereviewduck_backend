import { ApiProperty } from '@nestjs/swagger';
import { ReviewUserEntity } from 'src/review/entity/ReviewUser.entity';

export class OpinionEntity {
  @ApiProperty({ example: '1', description: '의견엔티티 식별자' })
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

  @ApiProperty({ example: '의견 제목입니다.', description: '의견 제목' })
  title: string;

  @ApiProperty({ example: '의견 내용입니다.', description: '의견 내용' })
  content: string;

  @ApiProperty({
    example: '의견 상태.',
    description: `'pending' | 'accepted' 중 하나의 값으로 전달됩니다.`,
  })
  status: string;

  @ApiProperty({
    example: '2024-07-31T02:05:22.376Z',
    description: '의견 내용',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-07-31T02:05:22.376Z',
    description: '의견 내용',
  })
  deletedAt: Date | null;

  constructor(data) {
    this.idx = data.idx;
    this.user = new ReviewUserEntity(data.accountTb);
    this.title = data.title;
    this.content = data.content;
    this.status = data.opinionStatusTb.statusName;
    this.createdAt = data.createdAt;
    this.deletedAt = data.deletedAt;
  }
}
