import { ApiProperty } from '@nestjs/swagger';

export class FollowEntity {
  @ApiProperty({
    example: '1',
    description: '팔로우하는 유저 idx',
  })
  followerIdx: number;

  @ApiProperty({
    example: '2',
    description: '팔로우되는 유저 idx',
  })
  followeeIdx: number;

  @ApiProperty({
    example: '2024-07-31T02:05:22.376Z',
    description: '팔로우시간',
  })
  createdAt: Date;
}
