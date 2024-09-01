import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

const notification = Prisma.validator<Prisma.NotificationTbDefaultArgs>()({});

type Notification = Prisma.NotificationTbGetPayload<typeof notification>;

export class NotificationEntity {
  @ApiProperty({
    example: 1,
    description: '알림보낸 유저 idx',
  })
  recipientIdx: string;

  @ApiProperty({
    example: 1,
    description: '알림받은 유저 idx',
  })
  senderIdx: string;

  @ApiProperty({
    example: 1,
    description:
      'Type: 1 => 팔로우한 경우, 2 => 리뷰 좋아요한 경우, 3 => 댓글 남긴 경우',
  })
  type: number;

  @ApiProperty({
    example: 1,
    description: 'type 2,3의 경우 존재',
    nullable: true,
  })
  reviewIdx: number;

  @ApiProperty({
    example: 1,
    description: '알림 메시지',
  })
  message: string;

  @ApiProperty({
    example: 1,
    description: '알림 생성시간',
  })
  createdAt: Date;

  @ApiProperty({
    example: 1,
    description: '알림 읽은 시간',
    nullable: true,
  })
  readAt: Date;

  constructor(data: Notification) {
    this.recipientIdx = data.recipientIdx;
    this.senderIdx = data.senderIdx;
    this.type = data.type;
    this.reviewIdx = data.reviewIdx;
    this.message = data.message;
    this.createdAt = data.createdAt;
    this.readAt = data.readAt;
  }
}
