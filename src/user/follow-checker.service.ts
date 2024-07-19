import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FollowEntity } from './entity/Follow.entity';

@Injectable()
export class FollowChecker {
  constructor(private readonly prismaService: PrismaService) {}

  async isFollow(
    userIdx: number,
    toUserIdx: number,
  ): Promise<FollowEntity | null> {
    const existingFollow = await this.prismaService.followTb.findFirst({
      where: {
        followerIdx: userIdx,
        followeeIdx: toUserIdx,
      },
    });

    return existingFollow;
  }
}
