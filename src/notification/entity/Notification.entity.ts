import { ApiProperty } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { NotificationUserEntity } from './NotificationUser.entity';

const notification = Prisma.validator<Prisma.NotificationTbDefaultArgs>()({
  include: {
    senderAccountTb: {
      include: {
        profileImgTb: true,
      },
    },
    notificationTypeTb: {
      select: {
        typeName: true,
      },
    },
  },
});

export type Notification = Prisma.NotificationTbGetPayload<typeof notification>;

//샌더의 유저 정보 필요, 프로필이미지, 닉네임, 팔로우 여부
export class NotificationEntity {
  @ApiProperty({
    example: 1,
    description: '알림받은 유저 idx',
  })
  recipientIdx: string;

  @ApiProperty({
    example: {
      idx: 'a3a066c8-845a-41d5-9862-54ea1a918a29',
      email: 'test2@a.com',
      nickname: 'nickname1',
      profileImg: 'default_img',
      isMyFollowing: true,
    },
    description: '알림보낸 유저 정보',
  })
  sender: NotificationUserEntity;

  @ApiProperty({
    example: 'follow_user / like_review / create_comment',
    description:
      'follow_user => 팔로우한 경우, like_review => 리뷰 좋아요한 경우, create_comment => 댓글 남긴 경우',
  })
  type: string;

  @ApiProperty({
    example: 1,
    description: '리뷰idx',
    nullable: true,
  })
  reviewIdx?: number;

  @ApiProperty({
    example: 1,
    description: '알림 메시지',
  })
  content?: string;

  @ApiProperty({
    example: 1,
    description: '댓글idx',
    nullable: true,
  })
  commentIdx?: number;

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
    this.sender = new NotificationUserEntity(data.senderAccountTb);
    this.type = data.notificationTypeTb.typeName;
    this.reviewIdx = data.reviewIdx;
    this.content = data.content;
    this.commentIdx = data.commentIdx;
    this.createdAt = data.createdAt;
    this.readAt = data.readAt;
  }
}
