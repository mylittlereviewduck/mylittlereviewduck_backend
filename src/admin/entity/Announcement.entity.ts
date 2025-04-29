import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  Max,
  Length,
} from 'class-validator';
import { ReviewUserEntity } from 'src/review/entity/ReviewUser.entity';

const announcement = Prisma.validator<Prisma.AnnouncementTbDefaultArgs>()({
  include: {
    accountTb: true,
  },
});

export type Announcement = Prisma.AnnouncementTbGetPayload<typeof announcement>;

export class AnnouncementEntity {
  @ApiProperty({ example: 1, description: '공지사항 고유 식별자' })
  @IsInt()
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
    description: '작성자 정보',
  })
  user: ReviewUserEntity;

  @ApiProperty({ example: '제목입니다', description: '공지사항 제목, 1-200자' })
  @IsString()
  @Length(1, 200, { message: '제목은 1-200자여야 합니다' })
  title: string;

  @ApiProperty({ example: '내용입니다', description: '공지사항 내용' })
  @IsString()
  @IsNotEmpty({ message: '내용은 비어 있을 수 없습니다' })
  content: string;

  @ApiProperty({
    example: 1,
    description: '카테고리, 1부터 10까지의 정수, 기본값 1',
    minimum: 1,
    maximum: 10,
  })
  @IsInt({ message: '카테고리는 정수이어야 합니다' })
  @Min(1, { message: '카테고리는 1 이상이어야 합니다' })
  @Max(10, { message: '카테고리는 10 이하여야 합니다' })
  category: number = 1;

  @ApiProperty({
    example: 'published',
    description: '공지사항 상태 (draft, published, archived)',
    enum: ['draft', 'published', 'archived'],
  })
  @IsString()
  @IsNotEmpty()
  status: string = 'published';

  @ApiProperty({ example: 10, description: '조회수, 기본값 0' })
  @IsInt()
  viewCount: number = 0;

  @ApiProperty({ example: false, description: '상단 고정 여부, 기본값 false' })
  @IsBoolean()
  isPinned: boolean = false;

  @ApiProperty({
    example: '2024-08-01T07:58:57.844Z',
    description: '작성일 타임스탬프',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-08-01T07:58:57.844Z',
    description: '수정일 타임스탬프',
    nullable: true,
  })
  updatedAt: Date | null;

  @ApiProperty({
    example: '2024-08-01T07:58:57.844Z',
    description: '삭제일 타임스탬프',
    nullable: true,
  })
  deletedAt: Date | null;

  constructor(data: Announcement) {
    this.idx = data.idx;
    this.user = new ReviewUserEntity(data.accountTb);
    this.category = data.category;
    this.status = data.status;
    this.viewCount = data.viewCount;
    this.isPinned = data.isPinned;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }
}
