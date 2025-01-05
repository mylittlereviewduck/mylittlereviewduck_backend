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
        isMyFollowing: false,
        isMyBlock: false,
        idx: 'fe1ca66a-6087-4efe-af23-0a695d8a8074',
        email: 'test25@a.com',
        profile: null,
        profileImg: null,
        nickname: '48번째 오리',
        interest1: null,
        interest2: null,
        isAdmin: false,
        serialNumber: 48,
        suspensionCount: 0,
        suspendExpireAt: null,
        reviewCount: 450,
        createdAt: '2024-10-20T06:13:04.267Z',
        followingCount: 0,
        followerCount: 1,
      },
      {
        isMyFollowing: false,
        isMyBlock: false,
        idx: 'a3a066c8-845a-41d5-9862-54ea1a918a29',
        email: 'test2@a.com',
        profile: '수정된 프로필',
        profileImg: null,
        nickname: 'nickname1',
        interest1: '스포츠',
        interest2: '여행',
        isAdmin: false,
        serialNumber: 24,
        suspensionCount: 0,
        suspendExpireAt: null,
        reviewCount: 450,
        createdAt: '2024-08-20T11:36:52.570Z',
        followingCount: 4,
        followerCount: 4,
      },
    ],
  })
  users: UserEntity[];
}
