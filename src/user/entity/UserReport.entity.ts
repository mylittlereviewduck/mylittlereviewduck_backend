import { ApiProperty } from '@nestjs/swagger';

export class UserReportEntity {
  @ApiProperty({ example: 1, description: '신고한 사람' })
  reporterIdx: number;

  @ApiProperty({ example: 10, description: '신고당한 사람' })
  reportedIdx: number;

  @ApiProperty({ example: '2024-08-01T07:58:57.844Z', description: '가입일' })
  createdAt: Date;

  constructor(data) {
    this.reporterIdx = data.reporterIdx;
    this.reportedIdx = data.reportedIdx;
    this.createdAt = data.createdAt;
  }
}
