import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/user/entity/User.entity';

export class UserListResponseDto {
  @ApiProperty({ example: 10, description: '최대 페이지수' })
  totalPage: number;

  @ApiProperty({
    description: '유저 목록',
    isArray: true,
    type: UserEntity,
    example: [
      {
        isFollowing: false,
        isBlocked: false,
        isReported: false,
        idx: 'bff9ee4f-883b-4cd5-a290-7445c386c2d0',
        email: 'a1@ex.com',
        profile: 'profile1',
        profileImg: 'img_path1',
        nickname: 'nick1',
        createdAt: '2024-06-16T07:36:41.550Z',
      },
      {
        isFollowing: true,
        isBlocked: false,
        isReported: false,
        idx: 'bff9ee4f-883b-4cd5-a290-7445c386c2d0',
        email: 'b2@ex.com',
        profile: 'profile2',
        profileImg: 'img_path2',
        nickname: 'nick2',
        createdAt: '2024-06-16T07:36:41.550Z',
      },
    ],
  })
  users: UserEntity[];
}
