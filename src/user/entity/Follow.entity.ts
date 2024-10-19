import { ApiProperty } from '@nestjs/swagger';

export class FollowEntity {
  @ApiProperty({
    example: 'de1704a4-bdd4-4df5-8fe8-053338cbac44',
    description: '팔로우하는 유저 idx',
  })
  followerIdx: string;

  @ApiProperty({
    example: '96189f51-1b01-4781-b9df-e659d551d665',
    description: '팔로우되는 유저 idx',
  })
  followeeIdx: string;

  @ApiProperty({
    example: '2024-07-31T02:05:22.376Z',
    description: '팔로우시간',
  })
  createdAt: Date;

  constructor(data) {
    this.followerIdx = data.followerIdx;
    this.followeeIdx = data.followeeIdx;
    this.createdAt = data.createdAt;
  }
}
