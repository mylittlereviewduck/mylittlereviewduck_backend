import { ApiProperty } from '@nestjs/swagger';
import { ReportEntity } from 'src/report/entity/Report.entity';

export class ReportPagerbleResponseDto {
  @ApiProperty({ example: 9, description: '전체 페이지 수' })
  totalPage: number;

  @ApiProperty({
    example: [
      {
        idx: 1,
        user: {
          idx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
          email: 'test1@a.com',
          nickname: '23번째 오리',
          profileImg:
            'https://s3.ap-northeast-2.amazonaws.com/todayreview/1724893124840.png',
          interest1: '여행',
          interest2: null,
        },
        title: '의견 제목입니다.',
        content: '의견 내용입니다.',
        status: '의견 상태.',
        createdAt: '2024-07-31T02:05:22.376Z',
        deletedAt: '2024-07-31T02:05:22.376Z',
      },
    ],
    description: '의견엔티티 리스트 형태로 반환',
  })
  reports: ReportEntity[];
}
