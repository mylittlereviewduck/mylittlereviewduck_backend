import { UserEntity } from 'src/user/entity/User.entity';

export const userEntityData: UserEntity = {
  isMyFollowing: false,
  isMyBlock: false,
  idx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
  email: 'test1@a.com',
  profile: null,
  profileImg:
    'https://s3.ap-northeast-2.amazonaws.com/todayreview/1724893124840.png',
  nickname: '23번째 오리',
  interest1: null,
  interest2: null,
  isAdmin: false,
  serialNumber: 23,
  suspensionCount: 17,
  suspendExpireAt: null,
  createdAt: new Date('2023-01-01T00:00:00Z'),
  followingCount: 6,
  followerCount: 6,
  reviewCount: 10,
};
