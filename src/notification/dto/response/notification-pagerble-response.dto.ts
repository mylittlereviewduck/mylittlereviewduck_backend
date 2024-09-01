import { ApiProperty } from '@nestjs/swagger';
import { NotificationEntity } from 'src/notification/entity/Notification.entity';

export class NotificationPagerbleResponseDto {
  @ApiProperty({ example: 9, description: '전체 페이지 수' })
  totalPage: number;

  @ApiProperty({
    description: '알림리스트',
    isArray: true,
    type: NotificationEntity,
    example: [
      {
        recipientIdx: 'a3a066c8-845a-41d5-9862-54ea1a918a29',
        senderIdx: 'a3a066c8-845a-41d5-9862-54ea1a918a29',
        type: 3,
        content: 'nickname1님이 댓글을 남겼습니다. 안녕안녕',
        createdAt: '2024-09-01T06:32:27.297Z',
        readAt: null,
      },
      {
        recipientIdx: 'a3a066c8-845a-41d5-9862-54ea1a918a29',
        senderIdx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
        type: 1,
        content: '23번째 오리님이 회원님을 팔로우하기 시작했습니다.',
        createdAt: '2024-09-01T06:33:28.407Z',
        readAt: null,
      },
    ],
  })
  notifications: NotificationEntity[];
}
