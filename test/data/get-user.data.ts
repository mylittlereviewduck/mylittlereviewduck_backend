import { User } from 'src/user/entity/User.entity';

export const getUserData: User = {
  email: 'test1@a.com',
  pw: '$2b$10$rM/2QRO85BGgkmyNRcf1s.iQ7ZUvswblKL4gEpYgY0TS3TCKlNSb6',
  nickname: '23번째 오리',
  profile: null,
  provider: 'local',
  providerKey: null,
  createdAt: new Date('2024-08-29T00:58:46.381Z'),
  deletedAt: null,
  idx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
  serialNumber: 23,
  interest1: null,
  interest2: null,
  suspensionCount: 17,
  isAdmin: false,
  suspendExpireAt: null,
  profileImgTb: [
    {
      idx: 86,
      imgPath:
        'https://s3.ap-northeast-2.amazonaws.com/todayreview/1724893124840.png',
      createdAt: new Date('2024-08-29T00:58:46.381Z'),
      accountIdx: '344e753e-9071-47b2-b651-bc32a0a92b1f',
    },
  ],
  _count: { followers: 6, followings: 6, reviewTb: 10 },
};
