import { ApiProperty } from '@nestjs/swagger';

export class ReviewEntity {
  @ApiProperty({ example: 1, description: '리뷰 idx' })
  idx: number;

  @ApiProperty({ example: 1, description: '작성자 idx' })
  accountIdx: number;

  @ApiProperty({ example: '제목입니다', description: '제목 255자' })
  title: string;

  @ApiProperty({ example: '내용입니다', description: '내용 글자제한X' })
  content: string;

  @ApiProperty({ example: 10, description: '조회수' })
  viewCount: number;

  @ApiProperty({ example: 10, description: '좋아요수' })
  likeCount: number;

  @ApiProperty({
    examples: ['태그1', '태그2', '태그3'],
    description: '태그 개수 제한x',
  })
  tags: string[];

  @ApiProperty({
    example: '2024-08-01T07:58:57.844Z',
    description: '작성일 타임스탬프',
  })
  createdAt: Date;

  constructor(data) {
    this.idx = data.idx;
    this.accountIdx = data.accountIdx;
    this.title = data.title;
    this.content = data.content;
    this.viewCount = data.viewCount;
    this.likeCount = data.likeCount;
    this.tags = data.tags;
    this.createdAt = data.createdAt;
  }
}
