export class FollowListPagerble {
  type: 'followeeIdx' | 'followerIdx';
  userIdx: number;
  page: number = 1;
  take: number = 10;
}
