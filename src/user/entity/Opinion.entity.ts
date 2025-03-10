import { ApiProperty } from '@nestjs/swagger';

export class OpinionEntity {
  @ApiProperty({ example: '1', description: '의견엔티티 식별자' })
  idx: number;

  @ApiProperty({
    example: 'de1704a4-bdd4-4df5-8fe8-053338cbac44',
    description: '작성자 식별자',
  })
  accountIdx: string;

  @ApiProperty({ example: '의견 제목입니다.', description: '의견 제목' })
  title: string;

  @ApiProperty({ example: '의견 내용입니다.', description: '의견 내용' })
  content: string;

  @ApiProperty({
    example: '의견 상태.',
    description: `'pending' | 'accepted' 중 하나`,
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
    this.accountIdx = data.accountIdx;
    this.title = data.title;
    this.content = data.content;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.deletedAt = data.deletedAt;
  }
}
