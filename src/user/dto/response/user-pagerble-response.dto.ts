import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from 'src/user/entity/User.entity';

export class UserPagerbleResponseDto {
  @ApiProperty({ example: 9, description: '전체 페이지 수' })
  totalPage: number;

  @ApiProperty({
    description: '유저리스트',
    isArray: true,
    type: UserEntity,
    example: [
      {
        isFollowing: false,
        isBlocked: false,
        isReported: false,
        idx: 1,
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
        idx: 2,
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
