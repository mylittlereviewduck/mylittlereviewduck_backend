import { AccountTb } from '@prisma/client';

export const testUserTb: AccountTb = {
  email: 'test1@a.com',
  pw: '$2b$10$rM/2QRO85BGgkmyNRcf1s.iQ7ZUvswblKL4gEpYgY0TS3TCKlNSb6',
  nickname: 'null',
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
  profileImg:
    'https://s3.ap-northeast-2.amazonaws.com/todayreview/1724893124840.png',
};
