import { UserService } from 'src/user/user.service';
import { FollowEntity } from './entity/Follow.entity';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { UserFollowService } from './user-follow.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class FollowService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly userFollowService: UserFollowService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async followUser(userIdx: string, toUserIdx: string): Promise<FollowEntity> {
    const user = await this.userService.getUser({ idx: toUserIdx });

    if (userIdx == toUserIdx) {
      throw new BadRequestException('Cannot Follow Myself');
    }

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    await this.userFollowService.isFollow(userIdx, [user]);

    if (user.isMyFollowing === true) {
      throw new ConflictException('Already Followed');
    }

    const followEntity = await this.prismaService.followTb.create({
      data: {
        followerIdx: userIdx,
        followeeIdx: toUserIdx,
      },
    });

    this.eventEmitter.emit('notification.create', {
      senderIdx: userIdx,
      recipientIdx: toUserIdx,
      type: 1,
    });

    return followEntity;
  }

  async unfollowUser(userIdx: string, toUserIdx: string): Promise<void> {
    const user = await this.userService.getUser({ idx: toUserIdx });

    if (!user) {
      throw new NotFoundException('Not Found User');
    }

    await this.userFollowService.isFollow(userIdx, [user]);

    if (user.isMyFollowing === false) {
      throw new ConflictException('Already Not Followed');
    }

    await this.prismaService.followTb.deleteMany({
      where: {
        followerIdx: userIdx,
        followeeIdx: toUserIdx,
      },
    });
  }
}
