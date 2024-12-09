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
        recipientIdx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
        sender: {
          idx: '14e8f257-27fa-4999-a723-84a3927e3d5b',
          email: 'test3@a.com',
          nickname: '25번째 오리',
          profileImg: null,
          isMyFollowing: false,
        },
        type: 'like_review',
        reviewIdx: 10102,
        content: '25번째 오리님이 내 리뷰를 좋아합니다.',
        commentIdx: null,
        createdAt: '2024-09-01T07:00:59.476Z',
        readAt: '2024-12-09T03:05:26.252Z',
      },
      {
        recipientIdx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
        sender: {
          idx: '14e8f257-27fa-4999-a723-84a3927e3d5b',
          email: 'test3@a.com',
          nickname: '25번째 오리',
          profileImg: null,
          isMyFollowing: false,
        },
        type: 'create_comment',
        reviewIdx: 10102,
        content: '25번째 오리님이 댓글을 남겼습니다. 안녕안녕66',
        commentIdx: null,
        createdAt: '2024-09-01T07:01:17.981Z',
        readAt: '2024-12-09T03:05:26.252Z',
      },
    ],
  })
  notifications: NotificationEntity[];
}
