export class UserFollowPagerbleDto {
  size: number;
  page: number;
  userIdx: string;
  type: 'follower' | 'followee';
}
