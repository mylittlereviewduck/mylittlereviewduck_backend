import { ApiProperty } from '@nestjs/swagger';
import { NotificationEntity } from 'src/notification/entity/Notification.entity';

export class NotificationPagerbleResponseDto {
  @ApiProperty({ example: 9, description: '전체 페이지 수' })
  totalPage: number;

  @ApiProperty({
    isArray: true,
    type: NotificationEntity,
    example: [
      {
        recipientIdx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
        sender: {
          idx: 'a3a066c8-845a-41d5-9862-54ea1a918a29',
          email: 'test2@a.com',
          nickname: 'nickname1',
          profileImg: null,
          isMyFollowing: true,
        },
        type: 'follow_user',
        reviewIdx: null,
        content: 'nickname1님이 회원님을 팔로우하기 시작했습니다.',
        commentIdx: null,
        createdAt: '2024-12-09T06:13:03.806Z',
        readAt: null,
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
